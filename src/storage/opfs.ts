export interface VaultMeta {
  id: string;
  name: string;
  createdAt: string;
  lastAccessedAt: string;
}

const VAULTS_META_FILE = 'vaults.json';

function getOpfsRoot(): Promise<FileSystemDirectoryHandle> {
  return navigator.storage.getDirectory();
}

export async function listVaults(): Promise<VaultMeta[]> {
  try {
    const root = await getOpfsRoot();
    const file = await root.getFileHandle(VAULTS_META_FILE);
    const blob = await file.getFile();
    const text = await blob.text();
    return JSON.parse(text);
  } catch {
    return [];
  }
}

export async function saveVaultsMeta(vaults: VaultMeta[]): Promise<void> {
  const root = await getOpfsRoot();
  const file = await root.getFileHandle(VAULTS_META_FILE, { create: true });
  const writable = await file.createWritable();
  await writable.write(JSON.stringify(vaults, null, 2));
  await writable.close();
}

export async function readVaultData(id: string): Promise<Uint8Array> {
  const root = await getOpfsRoot();
  const file = await root.getFileHandle(`${id}.kdbx`);
  const blob = await file.getFile();
  const buffer = await blob.arrayBuffer();
  return new Uint8Array(buffer);
}

export async function writeVaultData(id: string, data: Uint8Array): Promise<void> {
  const root = await getOpfsRoot();
  const file = await root.getFileHandle(`${id}.kdbx`, { create: true });
  const writable = await file.createWritable();
  await writable.write(new Uint8Array(data).buffer as ArrayBuffer);
  await writable.close();
}

export async function deleteVault(id: string): Promise<void> {
  const root = await getOpfsRoot();
  await root.removeEntry(`${id}.kdbx`);
  
  const vaults = await listVaults();
  const filtered = vaults.filter(v => v.id !== id);
  await saveVaultsMeta(filtered);
}

export async function createVaultMeta(name: string): Promise<VaultMeta> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const meta: VaultMeta = { id, name, createdAt: now, lastAccessedAt: now };
  
  const vaults = await listVaults();
  vaults.push(meta);
  await saveVaultsMeta(vaults);
  
  return meta;
}

export async function updateVaultAccessedAt(id: string): Promise<void> {
  const vaults = await listVaults();
  const vault = vaults.find(v => v.id === id);
  if (vault) {
    vault.lastAccessedAt = new Date().toISOString();
    await saveVaultsMeta(vaults);
  }
}

export async function exportVaultFile(id: string): Promise<Blob> {
  const data = await readVaultData(id);
  const buffer = new ArrayBuffer(data.length);
  new Uint8Array(buffer).set(data);
  return new Blob([buffer], { type: 'application/x-keepass2' });
}

export async function importVaultFile(file: File): Promise<VaultMeta> {
  const buffer = await file.arrayBuffer();
  const data = new Uint8Array(buffer);
  
  const name = file.name.replace(/\.kdbx$/i, '') || 'Imported Vault';
  const meta = await createVaultMeta(name);
  await writeVaultData(meta.id, data);
  
  return meta;
}

export async function checkOpfsSupport(): Promise<boolean> {
  try {
    return 'storage' in navigator && 'getDirectory' in (navigator.storage || {});
  } catch {
    return false;
  }
}
