import type { ElectronAPI, VaultMeta } from './index';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
  
  type IVaultMeta = VaultMeta;
}

export {};
