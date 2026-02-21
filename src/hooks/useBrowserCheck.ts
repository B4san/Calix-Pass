import { useState, useEffect } from 'react';

interface BrowserCapabilities {
  hasWebCrypto: boolean;
  hasWasm: boolean;
  hasOpfs: boolean;
  isSecureContext: boolean;
  isSupported: boolean;
}

export function useBrowserCheck() {
  const [capabilities, setCapabilities] = useState<BrowserCapabilities>({
    hasWebCrypto: false,
    hasWasm: false,
    hasOpfs: false,
    isSecureContext: false,
    isSupported: false,
  });
  
  useEffect(() => {
    const hasWebCrypto = typeof window.crypto !== 'undefined' && 
                         typeof window.crypto.subtle !== 'undefined';
    
    const hasWasm = typeof WebAssembly === 'object' &&
                    typeof WebAssembly.instantiate === 'function';
    
    const hasOpfs = 'storage' in navigator && 
                    typeof (navigator.storage as unknown as { getDirectory?: unknown }).getDirectory === 'function';
    
    const isSecureContext = window.isSecureContext;
    
    const isSupported = hasWebCrypto && hasWasm && isSecureContext;
    
    setCapabilities({
      hasWebCrypto,
      hasWasm,
      hasOpfs,
      isSecureContext,
      isSupported,
    });
  }, []);
  
  return capabilities;
}
