import { useEffect, useRef } from 'react';
import { useVaultStore } from '../stores/vaultStore';
import { useSettingsStore } from '../stores/settingsStore';

export function useAutoLock() {
  const { lockVault, database, isLocked } = useVaultStore();
  const { autoLockMinutes } = useSettingsStore();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (database && !isLocked && autoLockMinutes > 0) {
      timeoutRef.current = setTimeout(() => {
        lockVault();
      }, autoLockMinutes * 60 * 1000);
    }
  };
  
  useEffect(() => {
    if (!database || isLocked) return;
    
    resetTimer();
    
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    
    const handleActivity = () => {
      resetTimer();
    };
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [database, isLocked, autoLockMinutes]);
}
