import { useState, useCallback } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { useUIStore } from '../stores/uiStore';

export function useClipboard() {
  const [copied, setCopied] = useState(false);
  const { clipboardClearSeconds } = useSettingsStore();
  const { addToast } = useUIStore();
  
  const copy = useCallback(async (text: string, label: string = 'Text') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      addToast(`${label} copied to clipboard`, 'success');
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
      
      setTimeout(async () => {
        const currentText = await navigator.clipboard.readText();
        if (currentText === text) {
          await navigator.clipboard.writeText('');
        }
      }, clipboardClearSeconds * 1000);
    } catch (error) {
      addToast('Failed to copy to clipboard', 'error');
    }
  }, [clipboardClearSeconds, addToast]);
  
  return { copy, copied };
}
