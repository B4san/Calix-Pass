import { useBrowserCheck } from '../../hooks/useBrowserCheck';

export function BrowserCheck({ children }: { children: React.ReactNode }) {
  const capabilities = useBrowserCheck();
  
  if (!capabilities.isSupported) {
    return (
      <div className="min-h-screen bg-[var(--surface-base)] flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--warning-muted)] flex items-center justify-center">
            <svg className="w-8 h-8 text-[var(--warning)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            Browser Not Supported
          </h1>
          
          <p className="text-[var(--text-secondary)] mb-6">
            Calix Pass requires a modern browser with Web Crypto API and WebAssembly support.
            Please use a recent version of Chrome, Firefox, Safari, or Edge.
          </p>
          
          <div className="text-left bg-[var(--surface-inset)] rounded-[var(--radius-lg)] p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Web Crypto API</span>
              <span className={capabilities.hasWebCrypto ? 'text-[var(--success)]' : 'text-[var(--error)]'}>
                {capabilities.hasWebCrypto ? 'Available' : 'Missing'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)]">WebAssembly</span>
              <span className={capabilities.hasWasm ? 'text-[var(--success)]' : 'text-[var(--error)]'}>
                {capabilities.hasWasm ? 'Available' : 'Missing'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Secure Context (HTTPS)</span>
              <span className={capabilities.isSecureContext ? 'text-[var(--success)]' : 'text-[var(--error)]'}>
                {capabilities.isSecureContext ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}
