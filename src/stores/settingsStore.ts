import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  autoLockMinutes: number;
  clipboardClearSeconds: number;
  theme: 'light' | 'dark' | 'system';
  showProtectedFields: boolean;
  
  setAutoLockMinutes: (minutes: number) => void;
  setClipboardClearSeconds: (seconds: number) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setShowProtectedFields: (show: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      autoLockMinutes: 5,
      clipboardClearSeconds: 30,
      theme: 'system',
      showProtectedFields: false,
      
      setAutoLockMinutes: (minutes) => set({ autoLockMinutes: minutes }),
      setClipboardClearSeconds: (seconds) => set({ clipboardClearSeconds: seconds }),
      setTheme: (theme) => set({ theme }),
      setShowProtectedFields: (show) => set({ showProtectedFields: show }),
    }),
    {
      name: 'calix-pass-settings',
    }
  )
);
