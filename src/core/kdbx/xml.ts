import { Database, KDBXGroup, KDBXEntry, KDBXField } from '../model/database';
import { ChaCha20InnerStream } from '../crypto/inner-stream';
import { bytesToBase64, base64ToBytes } from '../utils/base64';
import { parseKDBXTime, formatKDBXTime } from '../utils/time';
import { uuidBytesToHex, hexToUuidBytes } from '../utils/uuid';

export function parseXML(data: Uint8Array, innerStream: ChaCha20InnerStream): Database {
  const text = new TextDecoder().decode(data);
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/xml');
  
  const root = doc.documentElement;
  const metaElem = root.querySelector('Meta');
  const rootElem = root.querySelector('Root > Group');
  
  if (!rootElem) {
    throw new Error('Invalid KDBX XML: missing root group');
  }
  
  const database: Database = {
    meta: {
      generator: metaElem?.querySelector('Generator')?.textContent || 'Calix Pass',
      databaseName: metaElem?.querySelector('DatabaseName')?.textContent || 'My Vault',
      databaseNameChanged: parseOptionalTime(metaElem?.querySelector('DatabaseNameChanged')?.textContent),
      description: metaElem?.querySelector('DatabaseDescription')?.textContent || undefined,
      defaultUserName: metaElem?.querySelector('DefaultUserName')?.textContent || undefined,
      recycleBinEnabled: metaElem?.querySelector('RecycleBinEnabled')?.textContent === 'True',
      recycleBinUuid: metaElem?.querySelector('RecycleBinUUID')?.textContent || undefined,
    },
    rootGroup: parseGroup(rootElem, innerStream),
    deletedObjects: [],
  };
  
  const deletedElems = root.querySelectorAll('Root > DeletedObjects > DeletedObject');
  for (const delElem of deletedElems) {
    database.deletedObjects.push({
      uuid: delElem.querySelector('UUID')?.textContent || '',
      deletionTime: parseOptionalTime(delElem.querySelector('DeletionTime')?.textContent),
    });
  }
  
  return database;
}

function parseGroup(elem: Element, innerStream: ChaCha20InnerStream): KDBXGroup {
  const group: KDBXGroup = {
    uuid: elem.querySelector('UUID')?.textContent || crypto.randomUUID(),
    name: elem.querySelector('Name')?.textContent || 'Untitled',
    notes: elem.querySelector('Notes')?.textContent || undefined,
    iconId: parseInt(elem.querySelector('IconID')?.textContent || '48', 10),
    isExpanded: elem.querySelector('IsExpanded')?.textContent === 'True',
    lastModificationTime: parseOptionalTime(elem.querySelector('LastModificationTime')?.textContent),
    creationTime: parseOptionalTime(elem.querySelector('CreationTime')?.textContent),
    groups: [],
    entries: [],
  };
  
  for (const childGroup of elem.querySelectorAll(':scope > Group')) {
    group.groups.push(parseGroup(childGroup, innerStream));
  }
  
  for (const childEntry of elem.querySelectorAll(':scope > Entry')) {
    group.entries.push(parseEntry(childEntry, innerStream));
  }
  
  return group;
}

function parseEntry(elem: Element, innerStream: ChaCha20InnerStream): KDBXEntry {
  const entry: KDBXEntry = {
    uuid: elem.querySelector('UUID')?.textContent || crypto.randomUUID(),
    fields: {},
    tags: [],
    iconId: parseInt(elem.querySelector('IconID')?.textContent || '0', 10),
    foregroundColor: elem.querySelector('ForegroundColor')?.textContent || undefined,
    backgroundColor: elem.querySelector('BackgroundColor')?.textContent || undefined,
    lastModificationTime: parseOptionalTime(elem.querySelector('LastModificationTime')?.textContent),
    creationTime: parseOptionalTime(elem.querySelector('CreationTime')?.textContent),
    lastAccessTime: parseOptionalTime(elem.querySelector('LastAccessTime')?.textContent),
    expiryTime: parseOptionalTime(elem.querySelector('ExpiryTime')?.textContent),
    expires: elem.querySelector('Expires')?.textContent === 'True',
    usageCount: parseInt(elem.querySelector('UsageCount')?.textContent || '0', 10),
    history: [],
    binaries: {},
  };
  
  for (const stringElem of elem.querySelectorAll('String')) {
    const key = stringElem.querySelector('Key')?.textContent;
    const valueElem = stringElem.querySelector('Value');
    if (key && valueElem) {
      const isProtected = valueElem.getAttribute('Protected') === 'True';
      let value = valueElem.textContent || '';
      
      if (isProtected && value) {
        try {
          const encryptedBytes = base64ToBytes(value);
          value = new TextDecoder().decode(innerStream.decrypt(encryptedBytes));
        } catch {
          // Keep original value if decryption fails
        }
      }
      
      entry.fields[key] = { value, protected: isProtected };
    }
  }
  
  const tags = elem.querySelector('Tags')?.textContent;
  if (tags) {
    entry.tags = tags.split(/[;,]/).map(t => t.trim()).filter(Boolean);
  }
  
  for (const binElem of elem.querySelectorAll('Binary')) {
    const key = binElem.querySelector('Key')?.textContent;
    const valueElem = binElem.querySelector('Value');
    if (key && valueElem) {
      const ref = valueElem.getAttribute('Ref');
      if (ref) {
        entry.binaries[key] = { ref };
      }
    }
  }
  
  for (const histElem of elem.querySelectorAll('History > Entry')) {
    entry.history.push(parseEntry(histElem, innerStream));
  }
  
  return entry;
}

function parseOptionalTime(text: string | null | undefined): Date | undefined {
  if (!text) return undefined;
  return parseKDBXTime(text);
}

export function serializeXML(database: Database, innerStream: ChaCha20InnerStream): Uint8Array {
  let xml = '<?xml version="1.0" encoding="utf-8" standalone="yes"?>\n';
  xml += '<KeePassFile>\n';
  
  xml += '  <Meta>\n';
  xml += `    <Generator>${escapeXml(database.meta.generator)}</Generator>\n`;
  xml += `    <DatabaseName>${escapeXml(database.meta.databaseName)}</DatabaseName>\n`;
  if (database.meta.databaseNameChanged) {
    xml += `    <DatabaseNameChanged>${formatKDBXTime(database.meta.databaseNameChanged)}</DatabaseNameChanged>\n`;
  }
  if (database.meta.description) {
    xml += `    <DatabaseDescription>${escapeXml(database.meta.description)}</DatabaseDescription>\n`;
  }
  if (database.meta.defaultUserName) {
    xml += `    <DefaultUserName>${escapeXml(database.meta.defaultUserName)}</DefaultUserName>\n`;
  }
  xml += `    <RecycleBinEnabled>${database.meta.recycleBinEnabled}</RecycleBinEnabled>\n`;
  if (database.meta.recycleBinUuid) {
    xml += `    <RecycleBinUUID>${database.meta.recycleBinUuid}</RecycleBinUUID>\n`;
  }
  xml += '  </Meta>\n';
  
  xml += '  <Root>\n';
  xml += serializeGroup(database.rootGroup, innerStream, 2);
  
  if (database.deletedObjects.length > 0) {
    xml += '    <DeletedObjects>\n';
    for (const obj of database.deletedObjects) {
      xml += '      <DeletedObject>\n';
      xml += `        <UUID>${obj.uuid}</UUID>\n`;
      if (obj.deletionTime) {
        xml += `        <DeletionTime>${formatKDBXTime(obj.deletionTime)}</DeletionTime>\n`;
      }
      xml += '      </DeletedObject>\n';
    }
    xml += '    </DeletedObjects>\n';
  }
  
  xml += '  </Root>\n';
  xml += '</KeePassFile>';
  
  return new TextEncoder().encode(xml);
}

function serializeGroup(group: KDBXGroup, innerStream: ChaCha20InnerStream, indent: number): string {
  const pad = '  '.repeat(indent);
  let xml = `${pad}<Group>\n`;
  
  xml += `${pad}  <UUID>${group.uuid}</UUID>\n`;
  xml += `${pad}  <Name>${escapeXml(group.name)}</Name>\n`;
  xml += `${pad}  <Notes>${escapeXml(group.notes || '')}</Notes>\n`;
  xml += `${pad}  <IconID>${group.iconId}</IconID>\n`;
  xml += `${pad}  <IsExpanded>${group.isExpanded}</IsExpanded>\n`;
  if (group.lastModificationTime) {
    xml += `${pad}  <LastModificationTime>${formatKDBXTime(group.lastModificationTime)}</LastModificationTime>\n`;
  }
  if (group.creationTime) {
    xml += `${pad}  <CreationTime>${formatKDBXTime(group.creationTime)}</CreationTime>\n`;
  }
  
  for (const childGroup of group.groups) {
    xml += serializeGroup(childGroup, innerStream, indent + 1);
  }
  
  for (const entry of group.entries) {
    xml += serializeEntry(entry, innerStream, indent + 1);
  }
  
  xml += `${pad}</Group>\n`;
  return xml;
}

function serializeEntry(entry: KDBXEntry, innerStream: ChaCha20InnerStream, indent: number): string {
  const pad = '  '.repeat(indent);
  let xml = `${pad}<Entry>\n`;
  
  xml += `${pad}  <UUID>${entry.uuid}</UUID>\n`;
  
  for (const [key, field] of Object.entries(entry.fields)) {
    xml += `${pad}  <String>\n`;
    xml += `${pad}    <Key>${escapeXml(key)}</Key>\n`;
    
    if (field.protected) {
      const encrypted = innerStream.encrypt(new TextEncoder().encode(field.value));
      xml += `${pad}    <Value Protected="True">${bytesToBase64(encrypted)}</Value>\n`;
    } else {
      xml += `${pad}    <Value>${escapeXml(field.value)}</Value>\n`;
    }
    
    xml += `${pad}  </String>\n`;
  }
  
  xml += `${pad}  <IconID>${entry.iconId}</IconID>\n`;
  xml += `${pad}  <ForegroundColor>${entry.foregroundColor || ''}</ForegroundColor>\n`;
  xml += `${pad}  <BackgroundColor>${entry.backgroundColor || ''}</BackgroundColor>\n`;
  xml += `${pad}  <Tags>${entry.tags.join('; ')}</Tags>\n`;
  xml += `${pad}  <UsageCount>${entry.usageCount}</UsageCount>\n`;
  
  if (entry.lastModificationTime) {
    xml += `${pad}  <LastModificationTime>${formatKDBXTime(entry.lastModificationTime)}</LastModificationTime>\n`;
  }
  if (entry.creationTime) {
    xml += `${pad}  <CreationTime>${formatKDBXTime(entry.creationTime)}</CreationTime>\n`;
  }
  if (entry.lastAccessTime) {
    xml += `${pad}  <LastAccessTime>${formatKDBXTime(entry.lastAccessTime)}</LastAccessTime>\n`;
  }
  xml += `${pad}  <Expires>${entry.expires}</Expires>\n`;
  if (entry.expiryTime) {
    xml += `${pad}  <ExpiryTime>${formatKDBXTime(entry.expiryTime)}</ExpiryTime>\n`;
  }
  
  if (entry.history.length > 0) {
    xml += `${pad}  <History>\n`;
    for (const histEntry of entry.history) {
      xml += serializeEntry(histEntry, innerStream, indent + 2);
    }
    xml += `${pad}  </History>\n`;
  }
  
  xml += `${pad}</Entry>\n`;
  return xml;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
