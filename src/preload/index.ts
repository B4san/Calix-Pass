import { contextBridge, ipcRenderer } from 'electron';

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

export interface ElectronAPI {
  selectFolder: () => Promise<{ path: string; vaults: VaultMeta[] } | null>;
  getVaultsPath: () => Promise<string | null>;
  getInitialPath: () => Promise<string | null>;
  listVaults: () => Promise<VaultMeta[]>;
  readVault: (id: string) => Promise<Uint8Array>;
  writeVault: (id: string, data: Uint8Array) => Promise<void>;
  createVault: (name: string, password?: string) => Promise<VaultMeta>;
  validateMasterPassword: (password: string) => Promise<PasswordValidationResult>;
  deleteVault: (id: string) => Promise<void>;
  exportVault: (id: string) => Promise<{ data: Uint8Array; name: string }>;
  writeExportFile: (targetPath: string, data: Uint8Array) => Promise<void>;
  importVault: (filePath: string) => Promise<VaultMeta>;
  selectImportFile: () => Promise<string | null>;
  selectExportFile: (defaultName: string) => Promise<string | null>;
}

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('storage:selectFolder'),
  getVaultsPath: () => ipcRenderer.invoke('storage:getVaultsPath'),
  getInitialPath: () => ipcRenderer.invoke('storage:getInitialPath'),
  listVaults: () => ipcRenderer.invoke('storage:listVaults'),
  readVault: (id: string) => ipcRenderer.invoke('storage:readVault', id),
  writeVault: (id: string, data: Uint8Array) => 
    ipcRenderer.invoke('storage:writeVault', id, data),
  createVault: (name: string, password?: string) => ipcRenderer.invoke('storage:createVault', name, password),
  validateMasterPassword: (password: string) => ipcRenderer.invoke('security:validateMasterPassword', password),
  deleteVault: (id: string) => ipcRenderer.invoke('storage:deleteVault', id),
  exportVault: (id: string) => ipcRenderer.invoke('storage:exportVault', id),
  writeExportFile: (targetPath: string, data: Uint8Array) =>
    ipcRenderer.invoke('storage:writeExportFile', targetPath, data),
  importVault: (filePath: string) => ipcRenderer.invoke('storage:importVault', filePath),
  selectImportFile: () => ipcRenderer.invoke('storage:selectImportFile'),
  selectExportFile: (defaultName: string) => 
    ipcRenderer.invoke('storage:selectExportFile', defaultName),
} as ElectronAPI);
