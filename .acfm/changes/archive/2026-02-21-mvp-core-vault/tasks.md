## Tasks

### Phase 1: Monorepo Setup

- [x] Create root `package.json` with Bun workspaces configuration
- [x] Create root `tsconfig.json` with strict mode and shared compiler options
- [x] Create `vitest.workspace.ts` for monorepo testing (integrated in core)
- [ ] Create `eslint.config.ts` with TypeScript and React rules
- [x] Create `.prettierrc` with formatting configuration
- [x] Create `.gitignore` with proper exclusions (node_modules, dist, .env, *.kdbx)

### Phase 2: @calix-pass/core Package Setup

- [x] Create `packages/core/package.json` with dependencies (hash-wasm, @stablelib/chacha, fflate)
- [x] Create `packages/core/tsconfig.json` extending root config
- [x] Create `packages/core/src/index.ts` as public API entry point
- [x] Create `packages/core/tests/` directory structure

### Phase 3: Core Crypto Module

- [x] Implement `packages/core/src/crypto/random.ts`: crypto.getRandomValues() wrapper with tests
- [x] Implement `packages/core/src/crypto/hash.ts`: SHA-256/SHA-512 via Web Crypto API with NIST test vectors
- [x] Implement `packages/core/src/crypto/aes256.ts`: AES-256-CBC encrypt/decrypt with PKCS7 padding, NIST test vectors
- [x] Implement `packages/core/src/crypto/hmac.ts`: HMAC-SHA-256 via Web Crypto API with RFC test vectors
- [x] Implement `packages/core/src/crypto/argon2.ts`: Argon2id key derivation via hash-wasm WASM module
- [x] Implement `packages/core/src/crypto/inner-stream.ts`: ChaCha20 via @stablelib for protected field values

### Phase 4: Core KDBX Module

- [x] Implement `packages/core/src/kdbx/header.ts`: Parse and serialize KDBX 4.x outer header fields
- [x] Implement `packages/core/src/kdbx/hmac-stream.ts`: HMAC block stream verification and generation
- [x] Implement `packages/core/src/kdbx/parser.ts`: Complete KDBX 4.0/4.1 binary parser
- [x] Implement `packages/core/src/kdbx/parser.ts`: Serialize Database model back to KDBX binary format (integrated)
- [x] Implement `packages/core/src/kdbx/xml.ts`: XML ↔ domain model mapping
- [ ] Add KDBX round-trip tests using reference .kdbx files from KeePassXC

### Phase 5: Core Domain Model

- [x] Implement `packages/core/src/model/database.ts`: Database, metadata, recycle bin reference, CRUD operations
- [x] Implement `packages/core/src/model/database.ts`: Group tree structure (integrated)
- [x] Implement `packages/core/src/model/database.ts`: Entry with fields, history tracking (integrated)
- [x] Implement `packages/core/src/model/database.ts`: Icon storage (integrated, readonly)
- [x] Implement `packages/core/src/model/database.ts`: Binary attachment handling (integrated, readonly)

### Phase 6: Core Utilities

- [x] Implement `packages/core/src/utils/uuid.ts`: UUID v4 generation via crypto.getRandomValues()
- [x] Implement `packages/core/src/utils/bytes.ts`: Little-endian read/write, Base64 encoding, hex conversion
- [x] Implement `packages/core/src/utils/secure-zero.ts`: Secure buffer zeroing utility
- [x] Implement `packages/core/src/utils/time.ts`: KDBX time format conversion (Base64 Int64 to Date)

### Phase 7: Core Password Generator

- [x] Implement `packages/core/src/generator/password.ts`: Character-based password generation with configurable charsets
- [x] Implement `packages/core/src/generator/passphrase.ts`: Diceware passphrase using EFF short word list
- [x] Implement `packages/core/src/generator/entropy.ts`: Entropy calculation for generated passwords (integrated)
- [x] Add tests for entropy distribution and charset coverage

### Phase 8: @calix-pass/web Package Setup

- [x] Create `packages/web/package.json` with React 19, Vite, Tailwind 4, Radix UI, Zustand
- [x] Create `packages/web/tsconfig.json` extending root config with JSX settings
- [x] Create `packages/web/vite.config.ts` with OPFS and WASM support
- [x] Create `packages/web/tailwind.config.ts` with design tokens (Inter font, blue accent)
- [x] Create `packages/web/index.html` with CSP headers meta tags
- [x] Create `packages/web/src/main.tsx` as entry point
- [x] Create `packages/web/src/App.tsx` root component

### Phase 9: Web Workers

- [ ] Implement `packages/web/src/workers/cryptoWorker.ts`: Web Worker for all crypto operations
- [ ] Implement `packages/web/src/lib/worker-bridge.ts`: Main thread ↔ Worker message protocol
- [ ] Add worker message types: open, save, create, deriveKey, generatePassword

### Phase 10: Web Storage Layer

- [x] Implement `packages/web/src/storage/opfs.ts`: OPFS read/write/delete operations
- [x] Implement `packages/web/src/storage/opfs.ts`: vaults.json metadata management (integrated)
- [ ] Implement `packages/web/src/storage/file-lock.ts`: Exclusive OPFS locking for concurrent tab prevention

### Phase 11: Web State Management

- [x] Implement `packages/web/src/stores/vaultStore.ts`: Database, isLocked, isDirty, lastSavedAt state
- [x] Implement `packages/web/src/stores/uiStore.ts`: Selection, modals, search, toasts state
- [x] Implement `packages/web/src/stores/settingsStore.ts`: Auto-lock timeout, clipboard clear, theme settings

### Phase 12: Web Hooks

- [x] Implement `packages/web/src/hooks/useVault.ts`: Vault CRUD operations with worker integration
- [x] Implement `packages/web/src/hooks/useClipboard.ts`: Copy with auto-clear functionality
- [x] Implement `packages/web/src/hooks/useAutoLock.ts`: Inactivity timeout and vault locking
- [x] Implement `packages/web/src/hooks/useSearch.ts`: Substring search across entry fields
- [x] Implement `packages/web/src/hooks/useBrowserCheck.ts`: Web Crypto, WASM, OPFS support detection

### Phase 13: Web Common Components

- [x] Implement `packages/web/src/components/common/Button.tsx`: Primary, secondary, ghost variants
- [x] Implement `packages/web/src/components/common/Input.tsx`: Text input with validation states
- [x] Implement `packages/web/src/components/common/Dialog.tsx`: Modal dialog via Radix UI
- [x] Implement `packages/web/src/components/common/Toast.tsx`: Toast notifications
- [x] Implement `packages/web/src/components/common/Dropdown.tsx`: Context menu via Radix UI
- [x] Implement `packages/web/src/components/common/BrowserCheck.tsx`: Browser compatibility warning

### Phase 14: Web Layout Components

- [x] Implement `packages/web/src/components/layout/AppShell.tsx`: 3-column responsive layout container
- [x] Implement `packages/web/src/components/layout/Sidebar.tsx`: Groups tree with expand/collapse
- [x] Implement `packages/web/src/components/layout/EntryList.tsx`: Scrollable entry list with search
- [x] Implement `packages/web/src/components/layout/DetailPanel.tsx`: Entry detail view container

### Phase 15: Web Vault Components

- [x] Implement `packages/web/src/components/vault/VaultPicker.tsx`: List of available vaults
- [x] Implement `packages/web/src/components/vault/CreateVaultDialog.tsx`: New vault creation form
- [x] Implement `packages/web/src/components/vault/UnlockDialog.tsx`: Master password input
- [ ] Implement `packages/web/src/components/vault/VaultLockScreen.tsx`: Locked vault overlay (integrated in UnlockDialog)

### Phase 16: Web Entry Components

- [x] Implement `packages/web/src/components/layout/DetailPanel.tsx`: Entry detail with copy (integrated)
- [ ] Implement `packages/web/src/components/entry/EntryForm.tsx`: Create/edit entry form
- [x] Implement `packages/web/src/components/layout/DetailPanel.tsx`: Field renderer with copy (integrated)
- [ ] Implement `packages/web/src/components/entry/EntryHistory.tsx`: History browser with restore

### Phase 17: Web Group Components

- [x] Implement `packages/web/src/components/layout/Sidebar.tsx`: Group tree (integrated)
- [x] Implement `packages/web/src/components/layout/Sidebar.tsx`: Group node with context menu (integrated)
- [ ] Implement `packages/web/src/components/group/GroupForm.tsx`: Create/rename group dialog

### Phase 18: Web Generator Components

- [x] Implement `packages/web/src/components/generator/PasswordGenerator.tsx`: Full generator UI
- [x] Implement `packages/web/src/components/generator/PasswordGenerator.tsx`: Character-based options (integrated)
- [x] Implement `packages/web/src/components/generator/PasswordGenerator.tsx`: Diceware options (integrated)

### Phase 19: Web Recycle Bin

- [x] Implement Recycle Bin group detection and special icon (in Sidebar)
- [ ] Implement permanent delete confirmation dialog
- [ ] Implement restore from Recycle Bin functionality

### Phase 20: Web Protected Values

- [ ] Implement XOR mask generation for protected field storage
- [ ] Implement protected field encryption/decryption on read/write
- [ ] Add session-scoped mask storage

### Phase 21: Web Attachments & Icons (Readonly)

- [ ] Implement custom icon display from imported .kdbx files
- [ ] Implement attachment list view with download buttons
- [ ] Preserve attachments on save (no modification)

### Phase 22: Integration & Final Assembly

- [ ] Wire up all components in App.tsx with routing logic
- [x] Implement browser check on app startup
- [ ] Implement auto-save on vault modifications
- [ ] Implement export vault to .kdbx file
- [ ] Add keyboard shortcuts (Ctrl+N new entry, Ctrl+L lock, etc.)

### Phase 23: Testing & Validation

- [ ] Add integration tests for vault open/save round-trip
- [ ] Add E2E tests for critical user flows (create, unlock, add entry)
- [ ] Validate KDBX compatibility with KeePassXC-generated files
- [ ] Performance test: Argon2id on low-end devices
- [ ] Security audit: verify no secrets in build output

### Phase 24: Documentation & Polish

- [ ] Add README.md with setup and usage instructions
- [ ] Add inline code comments for complex crypto operations
- [ ] Final UI polish and accessibility review
- [ ] Verify WCAG 2.1 AA compliance
