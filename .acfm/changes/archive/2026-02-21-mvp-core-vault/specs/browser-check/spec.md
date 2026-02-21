## ADDED: Browser Compatibility Check

### Requirements

- R1: The system MUST check for Web Crypto API availability (window.crypto.subtle) on startup
- R2: The system MUST check for WebAssembly support on startup
- R3: The system MUST check for Origin Private File System support on startup
- R4: The system MUST display a "Browser not supported" page if any required feature is missing
- R5: The system MUST list the minimum supported browsers: Chrome 86+, Firefox 111+, Safari 15.2+, Edge 86+
- R6: The system MUST log the feature check results to console for debugging

### Scenarios

- S1: WHEN a supported browser opens the app THEN the app loads normally
- S2: WHEN Web Crypto is unavailable (insecure context) THEN the "Browser not supported" page is shown
- S3: WHEN WebAssembly is disabled THEN the "Browser not supported" page is shown
- S4: WHEN OPFS is unavailable (very old browser) THEN a warning is shown but the app runs in-memory-only mode
- S5: WHEN the "Browser not supported" page is shown THEN it lists which features are missing
