export interface VaultMeta {
  id: string;
  name: string;
  fileName: string;
  createdAt: string;
  lastAccessedAt: string;
}

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

function getAPI() {
  if (!(window as any).electronAPI) {
    throw new Error('Electron API not available');
  }
  return (window as any).electronAPI;
}

export async function checkInitialPath(): Promise<string | null> {
  return getAPI().getInitialPath();
}

export async function selectFolder(): Promise<{ path: string; vaults: VaultMeta[] } | null> {
  return getAPI().selectFolder();
}

export async function getVaultsPath(): Promise<string | null> {
  return getAPI().getVaultsPath();
}

export async function listVaults(): Promise<VaultMeta[]> {
  return getAPI().listVaults();
}

export async function readVaultData(id: string): Promise<Uint8Array> {
  return getAPI().readVault(id);
}

export async function writeVaultData(id: string, data: Uint8Array): Promise<void> {
  return getAPI().writeVault(id, data);
}

export async function createVaultMeta(name: string, password?: string): Promise<VaultMeta> {
  return getAPI().createVault(name, password);
}

export async function validateMasterPassword(password: string): Promise<PasswordValidationResult> {
  return getAPI().validateMasterPassword(password);
}

export async function deleteVault(id: string): Promise<void> {
  return getAPI().deleteVault(id);
}

export async function exportVaultFile(id: string): Promise<{ data: Uint8Array; name: string }> {
  return getAPI().exportVault(id);
}

export async function writeExportFile(targetPath: string, data: Uint8Array): Promise<void> {
  return getAPI().writeExportFile(targetPath, data);
}

export async function importVaultFile(): Promise<VaultMeta | null> {
  const filePath = await getAPI().selectImportFile();
  if (!filePath) return null;
  
  return getAPI().importVault(filePath);
}

export async function selectExportFile(defaultName: string): Promise<string | null> {
  return getAPI().selectExportFile(defaultName);
}
