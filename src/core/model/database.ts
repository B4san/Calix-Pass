export interface KDBXField {
  value: string;
  protected: boolean;
}

export interface KDBXEntry {
  uuid: string;
  fields: Record<string, KDBXField>;
  iconId: number;
  tags: string[];
  foregroundColor?: string;
  backgroundColor?: string;
  lastModificationTime?: Date;
  creationTime?: Date;
  lastAccessTime?: Date;
  expiryTime?: Date;
  expires: boolean;
  usageCount: number;
  history: KDBXEntry[];
  binaries: Record<string, { ref: string }>;
}

export interface KDBXGroup {
  uuid: string;
  name: string;
  notes?: string;
  iconId: number;
  isExpanded: boolean;
  lastModificationTime?: Date;
  creationTime?: Date;
  groups: KDBXGroup[];
  entries: KDBXEntry[];
}

export interface DeletedObject {
  uuid: string;
  deletionTime?: Date;
}

export interface DatabaseMeta {
  generator: string;
  databaseName: string;
  databaseNameChanged?: Date;
  description?: string;
  defaultUserName?: string;
  recycleBinEnabled: boolean;
  recycleBinUuid?: string;
}

export interface Database {
  meta: DatabaseMeta;
  rootGroup: KDBXGroup;
  deletedObjects: DeletedObject[];
}

export function createEmptyDatabase(name: string = 'My Vault'): Database {
  const now = new Date();
  const recycleBinUuid = crypto.randomUUID();

  const recycleBinGroup: KDBXGroup = {
    uuid: recycleBinUuid,
    name: 'Recycle Bin',
    iconId: 49,
    isExpanded: true,
    creationTime: now,
    lastModificationTime: now,
    groups: [],
    entries: [],
  };

  return {
    meta: {
      generator: 'Calix Pass',
      databaseName: name,
      databaseNameChanged: now,
      recycleBinEnabled: true,
      recycleBinUuid,
    },
    rootGroup: {
      uuid: crypto.randomUUID(),
      name: name,
      iconId: 48,
      isExpanded: true,
      creationTime: now,
      lastModificationTime: now,
      groups: [recycleBinGroup],
      entries: [],
    },
    deletedObjects: [],
  };
}

export function findGroupByUuid(root: KDBXGroup, uuid: string): KDBXGroup | undefined {
  if (root.uuid === uuid) return root;
  for (const group of root.groups) {
    const found = findGroupByUuid(group, uuid);
    if (found) return found;
  }
  return undefined;
}

export function findEntryByUuid(root: KDBXGroup, uuid: string): KDBXEntry | undefined {
  for (const entry of root.entries) {
    if (entry.uuid === uuid) return entry;
  }
  for (const group of root.groups) {
    const found = findEntryByUuid(group, uuid);
    if (found) return found;
  }
  return undefined;
}

export function findParentGroup(root: KDBXGroup, entryUuid: string): KDBXGroup | undefined {
  for (const entry of root.entries) {
    if (entry.uuid === entryUuid) return root;
  }
  for (const group of root.groups) {
    const found = findParentGroup(group, entryUuid);
    if (found) return found;
  }
  return undefined;
}

export function findParentGroupForGroup(root: KDBXGroup, groupUuid: string): KDBXGroup | undefined {
  for (const group of root.groups) {
    if (group.uuid === groupUuid) return root;
    const found = findParentGroupForGroup(group, groupUuid);
    if (found) return found;
  }
  return undefined;
}

export function addEntry(root: KDBXGroup, groupUuid: string, entry: KDBXEntry): boolean {
  const group = findGroupByUuid(root, groupUuid);
  if (!group) return false;
  group.entries.push(entry);
  return true;
}

export function updateEntry(root: KDBXGroup, entry: KDBXEntry): boolean {
  const existing = findEntryByUuid(root, entry.uuid);
  if (!existing) return false;
  
  const parent = findParentGroup(root, entry.uuid);
  if (!parent) return false;
  
  const index = parent.entries.findIndex(e => e.uuid === entry.uuid);
  if (index === -1) return false;
  
  if (entry.history && entry.history.length > 0) {
    const historyEntry = { ...existing, history: [] };
    entry.history = [historyEntry, ...entry.history.slice(0, 9)];
  }
  
  parent.entries[index] = entry;
  return true;
}

export function deleteEntry(root: KDBXGroup, entryUuid: string): KDBXEntry | undefined {
  const parent = findParentGroup(root, entryUuid);
  if (!parent) return undefined;
  
  const index = parent.entries.findIndex(e => e.uuid === entryUuid);
  if (index === -1) return undefined;
  
  const [deleted] = parent.entries.splice(index, 1);
  return deleted;
}

export function addGroup(root: KDBXGroup, parentUuid: string, group: KDBXGroup): boolean {
  const parent = findGroupByUuid(root, parentUuid);
  if (!parent) return false;
  parent.groups.push(group);
  return true;
}

export function updateGroup(root: KDBXGroup, group: KDBXGroup): boolean {
  const existing = findGroupByUuid(root, group.uuid);
  if (!existing) return false;
  
  existing.name = group.name;
  existing.notes = group.notes;
  existing.iconId = group.iconId;
  existing.isExpanded = group.isExpanded;
  existing.lastModificationTime = new Date();
  
  return true;
}

export function deleteGroup(root: KDBXGroup, groupUuid: string): KDBXGroup | undefined {
  const parent = findParentGroupForGroup(root, groupUuid);
  if (!parent) return undefined;
  
  const index = parent.groups.findIndex(g => g.uuid === groupUuid);
  if (index === -1) return undefined;
  
  const [deleted] = parent.groups.splice(index, 1);
  return deleted;
}

export function collectAllEntries(root: KDBXGroup): KDBXEntry[] {
  const entries: KDBXEntry[] = [];
  
  function collect(group: KDBXGroup) {
    entries.push(...group.entries);
    for (const child of group.groups) {
      collect(child);
    }
  }
  
  collect(root);
  return entries;
}

export function collectAllGroups(root: KDBXGroup): KDBXGroup[] {
  const groups: KDBXGroup[] = [];
  
  function collect(group: KDBXGroup) {
    groups.push(group);
    for (const child of group.groups) {
      collect(child);
    }
  }
  
  collect(root);
  return groups;
}

export function getEntryTitle(entry: KDBXEntry): string {
  return entry.fields['Title']?.value || 'Untitled';
}

export function getEntryUsername(entry: KDBXEntry): string {
  return entry.fields['UserName']?.value || '';
}

export function getEntryPassword(entry: KDBXEntry): string {
  return entry.fields['Password']?.value || '';
}

export function getEntryUrl(entry: KDBXEntry): string {
  return entry.fields['URL']?.value || '';
}

export function getEntryNotes(entry: KDBXEntry): string {
  return entry.fields['Notes']?.value || '';
}

export function createEntry(title: string, username?: string, password?: string, url?: string): KDBXEntry {
  const now = new Date();
  return {
    uuid: crypto.randomUUID(),
    fields: {
      Title: { value: title, protected: false },
      UserName: { value: username || '', protected: false },
      Password: { value: password || '', protected: true },
      URL: { value: url || '', protected: false },
      Notes: { value: '', protected: false },
    },
    iconId: 0,
    tags: [],
    expires: false,
    usageCount: 0,
    history: [],
    binaries: {},
    creationTime: now,
    lastModificationTime: now,
    lastAccessTime: now,
  };
}

export function createGroup(name: string): KDBXGroup {
  const now = new Date();
  return {
    uuid: crypto.randomUUID(),
    name,
    iconId: 48,
    isExpanded: true,
    creationTime: now,
    lastModificationTime: now,
    groups: [],
    entries: [],
  };
}
