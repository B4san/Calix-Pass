## Why

Calix Pass does not yet exist as a functional application. The repository contains only governance documents, project constitution, and framework configuration. Users currently have no way to create, open, or manage password vaults.

The MVP Core Vault change delivers the foundational product: a fully functional KDBX 4.x-compatible password manager running in the browser. This is the minimum viable product that validates the core value proposition — a modern, open-source alternative to KeePass with a clean web UI, strong cryptography, and full format interoperability.

Without this change, Calix Pass is documentation without software.

## What Changes

This change builds the entire application from scratch across two monorepo packages:

1. **`@calix-pass/core`** — Framework-agnostic cryptographic engine and KDBX 4.x parser/serializer. Zero browser dependencies. Handles encryption (AES-256-CBC), key derivation (Argon2id via WASM), HMAC-SHA-256 integrity verification, binary format parsing, XML database serialization, and domain model (Database, Group, Entry, History).

2. **`@calix-pass/web`** — React 19 web application with Vite. 3-column layout UI (groups tree, entry list, entry detail). Zustand state management. OPFS persistence. Web Worker crypto offloading. Password generator (character + passphrase). Clipboard management with auto-clear. Vault locking with auto-lock timeout.

3. **Monorepo root** — Bun workspace configuration, shared TypeScript config, Vitest workspace, ESLint/Prettier config.

## Capabilities

### New Capabilities
- `vault-create`: Create new KDBX 4.x vaults with master password authentication
- `vault-open`: Open existing .kdbx files via File API with decryption and integrity verification
- `vault-save`: Save vaults to OPFS and export as .kdbx files via File API
- `vault-lock`: Lock/unlock vaults with configurable auto-lock timeout (default 5 min)
- `kdbx-parse`: Parse KDBX 4.0/4.1 binary format (outer header, HMAC block stream, inner header, XML)
- `kdbx-serialize`: Serialize database back to KDBX 4.x binary format with Encrypt-then-MAC
- `crypto-aes256`: AES-256-CBC encryption/decryption via Web Crypto API
- `crypto-argon2`: Argon2id key derivation via hash-wasm WASM module
- `crypto-hmac`: HMAC-SHA-256 block stream integrity verification
- `crypto-innerstream`: ChaCha20/Salsa20 inner random stream for protected field values
- `entry-crud`: Create, read, update, delete password entries with history tracking
- `group-crud`: Create, read, update, delete groups with tree hierarchy
- `group-move`: Move entries and groups between groups via context menu
- `recycle-bin`: Soft-delete entries/groups to Recycle Bin with permanent delete
- `search`: Substring search across Title, UserName, URL, Notes, Tags
- `password-generator`: Character-based and diceware passphrase generation with configurable options
- `clipboard-manager`: Copy fields to clipboard with auto-clear after 10 seconds
- `protected-values`: XOR-masked in-memory storage for sensitive field values (Password)
- `opfs-storage`: OPFS-based vault persistence with metadata index (vaults.json)
- `file-locking`: Exclusive OPFS locks to prevent concurrent tab access
- `custom-icons-readonly`: Display custom icons from imported .kdbx files
- `attachments-readonly`: Preserve and display binary attachments from imported .kdbx files with download
- `browser-check`: Startup compatibility check for Web Crypto, WASM, and OPFS support

### Modified Capabilities
- None (greenfield project)

## Impact

### Code Impact
- **New packages**: `packages/core/`, `packages/web/`
- **New root config**: `package.json`, `tsconfig.json`, `vitest.workspace.ts`, `eslint.config.ts`, `.prettierrc`
- **Estimated files**: ~80-120 source files across both packages
- **Estimated LOC**: ~8,000-12,000 TypeScript

### Dependencies (New)
- `react` 19.x, `react-dom` 19.x — UI framework
- `@radix-ui/*` — Accessible UI primitives (dialog, dropdown, tooltip, etc.)
- `tailwindcss` 4.x — Utility-first CSS
- `zustand` — State management
- `hash-wasm` — Argon2id/Argon2d WASM + SHA family
- `vite` — Build tool
- `vitest` — Test framework
- `typescript` 5.x — Language
- `eslint`, `prettier` — Code quality

### Systems Affected
- None (greenfield). No existing APIs, databases, or services impacted.

### Risks
1. **KDBX format fidelity** — Subtle binary format bugs could cause data loss or incompatibility. Mitigated by round-trip testing against KeePassXC-generated reference files.
2. **Argon2 WASM performance** — 64MB memory allocation in browser may fail on low-memory devices. Mitigated by progressive degradation messaging.
3. **OPFS browser support** — Safari has lagging OPFS support. Mitigated by graceful fallback to in-memory-only mode with export prompt.
4. **ChaCha20 implementation** — Web Crypto API does not natively support ChaCha20. Must use a JS/WASM implementation for inner stream. Mitigated by using audited library.
