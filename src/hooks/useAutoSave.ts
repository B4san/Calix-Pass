import { useEffect, useRef } from 'react';
import { useVaultStore } from '../stores/vaultStore';

export function useAutoSave(delayMs: number = 2000) {
  const { isDirty, saveVault } = useVaultStore();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  useEffect(() => {
    if (!isDirty) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      saveVault();
    }, delayMs);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isDirty, delayMs, saveVault]);
}
