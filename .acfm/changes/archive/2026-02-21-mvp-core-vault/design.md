## Context

Calix Pass is a greenfield project to build a modern, open-source password manager with full KDBX 4.x compatibility. The repository currently contains only governance documents and framework configuration—no application code exists yet.

The MVP delivers a complete, functional password manager that:
- Creates, opens, and saves KDBX 4.x vaults (compatible with KeePassXC/KeePass 2.x)
- Provides a clean 3-column web UI (groups tree, entry list, entry detail)
- Runs cryptographic operations off-main-thread via Web Workers
- Persists vaults to browser storage via OPFS

## Goals

1. **KDBX 4.x Fidelity**: Files created by Calix Pass must be seamlessly openable by KeePassXC, and vice versa—zero data loss on round-trip.
2. **Cryptographic Rigor**: All crypto via Web Crypto API (AES-256-CBC, SHA-256, HMAC) or audited WASM (Argon2id). No custom implementations.
3. **Web-First Architecture**: Fully functional in-browser app; desktop (Electron) shares the same codebase but is deferred post-MVP.
4. **Responsive UX**: 3-column layout that remains responsive; crypto offloaded to Workers to keep main thread < 16ms.
5. **Local-First Storage**: OPFS-based persistence; no server, no network dependency, no telemetry.
6. **Accessible UI**: WCAG 2.1 AA compliance via Radix UI primitives; full keyboard navigation.

## Non-Goals

- KDBX 3.x format support (can be added later if demanded)
- Cloud sync / multi-device sync (requires user's own cloud storage)
- Mobile native apps (React Native wrapper is post-MVP)
- Browser extension autofill (separate project)
- Biometric unlock (platform-specific, post-MVP)
- KeePassXC feature parity for advanced features (e.g., SSH agent, YubiKey challenge-response)

## Design Decisions

### Decision: Monorepo Structure with Two Packages

- **Approach:** Bun workspaces with `packages/core/` (crypto engine) and `packages/web/` (React app).
- **Rationale:** Clean separation between framework-agnostic crypto logic and UI enables independent testing, future portability (CLI, mobile), and enforces the principle that UI components must not contain crypto operations.
- **Alternatives considered:**
  - Single package: Would mix concerns, harder to test crypto in isolation.
  - More packages (e.g., `@calix-pass/crypto`, `@calix-pass/kdbx`): Overhead for MVP scope.

### Decision: Web Crypto API + hash-wasm for Cryptography

- **Approach:** Use native `crypto.subtle` for AES-256-CBC, SHA-256, HMAC-SHA-256. Use `hash-wasm` (Rust→WASM) for Argon2id key derivation.
- **Rationale:** Web Crypto API is hardware-backed (secure enclave on supported devices) and audited. Argon2id is not available in Web Crypto; hash-wasm is actively maintained and auditable.
- **Alternatives considered:**
  - libsodium.js: Larger bundle, more than needed.
  - Custom Argon2id in pure JS: Too slow for 64MB memory cost, security risk.

### Decision: ChaCha20 Inner Stream via Stable Library

- **Approach:** Use `@stablelib/chacha20` for protected field value encryption/decryption in KDBX inner random stream.
- **Rationale:** ChaCha20 is not available in Web Crypto API. @stablelib is audited and widely used.
- **Alternatives considered:**
  - Implement ChaCha20 from RFC 8439: Security risk, maintenance burden.
  - TweetNaCl: Includes more than needed.

### Decision: Web Workers for All Heavy Crypto

- **Approach:** All AES, Argon2id, and KDBX parsing/serialization run in a dedicated Web Worker. Main thread posts messages and receives results.
- **Rationale:** Argon2id with 64MB memory cost can take 200-500ms on mobile; this would block UI. Workers keep main thread responsive.
- **Alternatives considered:**
  - Main thread only: Unacceptable UX on low-end devices.
  - WASM threads (SharedArrayBuffer): Requires COOP/COEP headers, complicates deployment.

### Decision: OPFS for Vault Persistence

- **Approach:** Use Origin Private File System (`navigator.storage.getDirectory()`) for storing .kdbx files. Maintain a `vaults.json` index file for metadata.
- **Rationale:** OPFS is private to origin, performant (native file handles), and works offline. No server required.
- **Alternatives considered:**
  - IndexedDB: Less efficient for binary files, harder to export.
  - LocalStorage: Size limits, not designed for binary data.

### Decision: Zustand for State Management

- **Approach:** Use Zustand with atomic selectors for vault state, UI state, and settings.
- **Rationale:** Minimal boilerplate, excellent TypeScript support, atomic updates prevent unnecessary re-renders.
- **Alternatives considered:**
  - Redux Toolkit: More boilerplate, overkill for MVP scope.
  - Jotai/Recoil: Good but Zustand has larger ecosystem and simpler mental model.

### Decision: Radix UI + Tailwind CSS 4 for UI

- **Approach:** Use Radix UI primitives for accessible components (dialog, dropdown, tooltip, tabs). Style with Tailwind CSS 4.
- **Rationale:** Radix provides WCAG-compliant primitives out of the box. Tailwind 4 has improved performance and CSS-first configuration.
- **Alternatives considered:**
  - shadcn/ui: Built on Radix, could adopt later.
  - Chakra UI: Heavier, less Tailwind-native.
  - Custom components: Too much accessibility work.

### Decision: XOR-Masked Protected Values in Memory

- **Approach:** Store password field values as `Uint8Array` XORed with a random mask. The mask is stored separately in session state.
- **Rationale:** Prevents passwords from appearing in plaintext in heap snapshots or debugger inspections. Not cryptographically secure, but raises the bar.
- **Alternatives considered:**
  - Plaintext strings: Strings are immutable in JS, cannot zero them.
  - No protection: Unacceptable for a password manager.

### Decision: HMAC Block Stream for Integrity

- **Approach:** Implement KDBX 4.x HMAC block stream exactly as specified—each block is verified with HMAC-SHA-256 before decryption.
- **Rationale:** Encrypt-then-MAC provides integrity verification. Block-level HMAC detects tampering before decryption attempt.
- **Alternatives considered:**
  - Skip HMAC verification: Would violate KDBX spec and security principles.

### Decision: File Locking via OPFS Exclusive Locks

- **Approach:** Acquire exclusive lock on the vault file in OPFS when opening. Release on close/lock. Prevent concurrent tab access to same vault.
- **Rationale:** Prevents data corruption if user opens same vault in multiple tabs.
- **Alternatives considered:**
  - No locking: Could corrupt vault data.
  - Optimistic locking with merge: Too complex for MVP.

## Architecture

### Package Structure

```
calix-pass/
├── packages/
│   ├── core/                          # @calix-pass/core
│   │   ├── src/
│   │   │   ├── crypto/
│   │   │   │   ├── aes256.ts          # AES-256-CBC wrapper
│   │   │   │   ├── argon2.ts          # Argon2id via hash-wasm
│   │   │   │   ├── hmac.ts            # HMAC-SHA-256 wrapper
│   │   │   │   ├── hash.ts            # SHA-256/512 wrapper
│   │   │   │   ├── random.ts          # crypto.getRandomValues wrapper
│   │   │   │   └── inner-stream.ts    # ChaCha20/Salsa20 protected values
│   │   │   ├── kdbx/
│   │   │   │   ├── parser.ts          # KDBX binary parser
│   │   │   │   ├── serializer.ts      # KDBX binary serializer
│   │   │   │   ├── header.ts          # Outer/inner header handling
│   │   │   │   ├── hmac-stream.ts     # HMAC block stream
│   │   │   │   └── xml.ts             # XML ↔ domain model mapping
│   │   │   ├── model/
│   │   │   │   ├── database.ts        # Database, metadata
│   │   │   │   ├── group.ts           # Group tree structure
│   │   │   │   ├── entry.ts           # Entry with fields, history
│   │   │   │   ├── icon.ts            # Custom icons
│   │   │   │   └── attachment.ts      # Binary attachments
│   │   │   ├── generator/
│   │   │   │   ├── password.ts        # Character-based generation
│   │   │   │   └── passphrase.ts      # Diceware passphrase
│   │   │   ├── utils/
│   │   │   │   ├── uuid.ts            # UUID generation/parsing
│   │   │   │   ├── bytes.ts           # Little-endian, Base64
│   │   │   │   └── secure-zero.ts     # Memory cleanup
│   │   │   └── index.ts               # Public exports
│   │   └── tests/                     # Unit tests with NIST/RFC vectors
│   │
│   └── web/                           # @calix-pass/web
│       ├── src/
│       │   ├── components/
│       │   │   ├── layout/
│       │   │   │   ├── AppShell.tsx   # 3-column layout container
│       │   │   │   ├── Sidebar.tsx    # Groups tree column
│       │   │   │   ├── EntryList.tsx  # Entries list column
│       │   │   │   └── DetailPanel.tsx# Entry detail column
│       │   │   ├── vault/
│       │   │   │   ├── VaultPicker.tsx
│       │   │   │   ├── CreateVaultDialog.tsx
│       │   │   │   └── UnlockDialog.tsx
│       │   │   ├── entry/
│       │   │   │   ├── EntryCard.tsx
│       │   │   │   ├── EntryForm.tsx
│       │   │   │   └── FieldRenderer.tsx
│       │   │   ├── generator/
│       │   │   │   └── PasswordGenerator.tsx
│       │   │   └── common/             # Buttons, inputs, dialogs
│       │   ├── stores/
│       │   │   ├── vaultStore.ts      # Active vault, groups, entries
│       │   │   ├── uiStore.ts         # Selection, modals, toasts
│       │   │   └── settingsStore.ts   # Auto-lock timeout, etc.
│       │   ├── workers/
│       │   │   └── cryptoWorker.ts    # Web Worker for crypto operations
│       │   ├── storage/
│       │   │   ├── opfs.ts            # OPFS read/write/delete
│       │   │   └── vault-index.ts     # vaults.json management
│       │   ├── hooks/
│       │   │   ├── useVault.ts
│       │   │   ├── useClipboard.ts
│       │   │   └── useAutoLock.ts
│       │   ├── lib/
│       │   │   └── worker-bridge.ts   # Main thread ↔ Worker messaging
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── public/
│       └── index.html
├── package.json                       # Bun workspace root
├── tsconfig.json                      # Shared TypeScript config
├── vitest.workspace.ts                # Test workspace
├── eslint.config.ts                   # Lint config
└── .prettierrc                        # Format config
```

### Data Flow: Open Vault

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           OPEN VAULT FLOW                                    │
└─────────────────────────────────────────────────────────────────────────────┘

User                     UI                      Worker                  Core
 │                        │                         │                       │
 │  Select .kdbx file     │                         │                       │
 │───────────────────────>│                         │                       │
 │                        │  Read file via OPFS     │                       │
 │                        │─────────────────────────────────────────────────>│
 │                        │                         │                       │
 │  Enter master password │                         │                       │
 │───────────────────────>│                         │                       │
 │                        │  postMessage({          │                       │
 │                        │    type: 'open',        │                       │
 │                        │    fileData,            │                       │
 │                        │    passwordHash         │                       │
 │                        │  })                     │                       │
 │                        │────────────────────────>│                       │
 │                        │                         │                       │
 │                        │                         │  Argon2id KDF         │
 │                        │                         │──────────────────────>│
 │                        │                         │<──────────────────────│
 │                        │                         │  derivedKey           │
 │                        │                         │                       │
 │                        │                         │  Verify HMAC blocks   │
 │                        │                         │──────────────────────>│
 │                        │                         │<──────────────────────│
 │                        │                         │  blockData            │
 │                        │                         │                       │
 │                        │                         │  AES-256-CBC decrypt  │
 │                        │                         │──────────────────────>│
 │                        │                         │<──────────────────────│
 │                        │                         │  plaintext            │
 │                        │                         │                       │
 │                        │                         │  Parse KDBX structure │
 │                        │                         │──────────────────────>│
 │                        │                         │<──────────────────────│
 │                        │                         │  Database model       │
 │                        │                         │                       │
 │                        │  postMessage({          │                       │
 │                        │    type: 'opened',      │                       │
 │                        │    database            │                       │
 │                        │  })                     │                       │
 │                        │<────────────────────────│                       │
 │                        │                         │                       │
 │  Vault unlocked        │                         │                       │
 │<───────────────────────│                         │                       │
 │                        │                         │                       │
```

### Data Flow: Save Vault

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SAVE VAULT FLOW                                    │
└─────────────────────────────────────────────────────────────────────────────┘

User                     UI                      Worker                  Core
 │                        │                         │                       │
 │  Edit entry/field      │                         │                       │
 │───────────────────────>│                         │                       │
 │                        │  Update Zustand store   │                       │
 │                        │                         │                       │
 │  Auto-save trigger     │                         │                       │
 │───────────────────────>│                         │                       │
 │                        │  postMessage({          │                       │
 │                        │    type: 'save',        │                       │
 │                        │    database,            │                       │
 │                        │    masterKeyHash        │                       │
 │                        │  })                     │                       │
 │                        │────────────────────────>│                       │
 │                        │                         │                       │
 │                        │                         │  Serialize to KDBX    │
 │                        │                         │──────────────────────>│
 │                        │                         │<──────────────────────│
 │                        │                         │  kdbxBytes            │
 │                        │                         │                       │
 │                        │                         │  AES-256-CBC encrypt  │
 │                        │                         │──────────────────────>│
 │                        │                         │<──────────────────────│
 │                        │                         │  ciphertext           │
 │                        │                         │                       │
 │                        │                         │  Build HMAC blocks    │
 │                        │                         │──────────────────────>│
 │                        │                         │<──────────────────────│
 │                        │                         │  hmacBlocks           │
 │                        │                         │                       │
 │                        │  postMessage({          │                       │
 │                        │    type: 'saved',       │                       │
 │                        │    kdbxData            │                       │
 │                        │  })                     │                       │
 │                        │<────────────────────────│                       │
 │                        │                         │                       │
 │                        │  Write to OPFS          │                       │
 │                        │─────────────────────────────────────────────────>│
 │                        │                         │                       │
 │  Toast: Saved          │                         │                       │
 │<───────────────────────│                         │                       │
 │                        │                         │                       │
```

### Component Interaction

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              RUNTIME ARCHITECTURE                             │
└──────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                                  Main Thread                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────┐    ┌────────────────┐    ┌────────────────┐             │
│  │   AppShell     │───>│    Sidebar     │    │  DetailPanel   │             │
│  │   (Layout)     │    │  (Groups Tree) │    │ (Entry Detail) │             │
│  └────────────────┘    └────────────────┘    └────────────────┘             │
│           │                    │                     │                       │
│           └────────────────────┼─────────────────────┘                       │
│                                │                                             │
│                                ▼                                             │
│                    ┌───────────────────────┐                                 │
│                    │     Zustand Store     │                                 │
│                    │  ┌─────────────────┐  │                                 │
│                    │  │   vaultStore    │  │                                 │
│                    │  │   - database    │  │                                 │
│                    │  │   - isLocked    │  │                                 │
│                    │  └─────────────────┘  │                                 │
│                    │  ┌─────────────────┐  │                                 │
│                    │  │    uiStore      │  │                                 │
│                    │  │   - selectedId  │  │                                 │
│                    │  │   - modal       │  │                                 │
│                    │  └─────────────────┘  │                                 │
│                    └───────────────────────┘                                 │
│                                │                                             │
│                    ┌───────────┴───────────┐                                 │
│                    │     Worker Bridge     │                                 │
│                    │  (postMessage API)    │                                 │
│                    └───────────┬───────────┘                                 │
│                                │                                             │
└────────────────────────────────┼─────────────────────────────────────────────┘
                                 │
                                 │ MessageChannel / postMessage
                                 │
┌────────────────────────────────┼─────────────────────────────────────────────┐
│                                ▼                                             │
│                               Web Worker                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                         cryptoWorker.ts                                  ││
│  │                                                                         ││
│  │  Handles: open, save, create, deriveKey, generatePassword               ││
│  │                                                                         ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    ││
│  │  │  Argon2id   │  │  AES-256    │  │ HMAC-SHA256 │  │ KDBX Parser │    ││
│  │  │  (hash-wasm)│  │ (Web Crypto)│  │ (Web Crypto)│  │  Serializer │    ││
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    ││
│  │                                                                         ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                                 │
                                 │
┌────────────────────────────────┼─────────────────────────────────────────────┐
│                                ▼                                             │
│                              OPFS Storage                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  origin-private-fs:/                                                         │
│  ├── vaults/                                                                 │
│  │   ├── {uuid-1}.kdbx                                                      │
│  │   ├── {uuid-2}.kdbx                                                      │
│  │   └── ...                                                                 │
│  └── vaults.json                                                             │
│      [{ uuid, name, createdAt, lastOpened }]                                │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### State Model

```typescript
interface VaultStore {
  database: Database | null;
  isLocked: boolean;
  isDirty: boolean;
  lastSavedAt: number | null;
}

interface UIStore {
  selectedGroupId: string | null;
  selectedEntryId: string | null;
  searchQuery: string;
  activeModal: 'create-vault' | 'unlock' | 'generator' | null;
  toasts: Toast[];
}

interface SettingsStore {
  autoLockTimeoutMs: number;
  clipboardClearSeconds: number;
  theme: 'light' | 'dark' | 'system';
}
```

### Critical Implementation Paths

1. **KDBX Parser → HMAC Stream → AES Decryption → XML → Domain Model**
   - Must handle binary format edge cases
   - Must preserve unknown XML elements for round-trip

2. **Password Generator → Entropy Source**
   - Must use `crypto.getRandomValues()` exclusively
   - Configurable character sets and length

3. **Clipboard Manager → Auto-Clear**
   - `setTimeout` for auto-clear
   - Handle page visibility changes

4. **OPFS Adapter → Concurrent Access**
   - Acquire FileSystemSyncAccessHandle
   - Release on vault lock/close

5. **Protected Values → XOR Mask**
   - Mask generated once per session
   - Applied on read, stored masked
