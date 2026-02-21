# Calix Pass - Project Index

**Version**: 1.1.0
**Last Updated**: 2026-02-20
**Status**: Implementation (Electron Desktop + Production Hardening)

---

## Project Overview

Calix Pass is a modern, open-source password manager built as a
web-first application. It implements full KDBX 4.x format
compatibility to serve as a contemporary alternative to KeePass,
with a clean React-based UI and cryptographic operations powered
by Web Crypto API and WASM.

---

## Repository Structure

```
calix-pass/
├── .acfm/                    # AC Framework spec management
│   ├── config.yaml
│   ├── specs/                # Shared specifications
│   └── changes/              # Active changes
│       └── archive/          # Completed changes
├── .opencode/                # OpenCode tooling
│   └── skills/               # Available agent skills
├── .specify/                 # Project governance
│   └── memory/
│       ├── constitution.md   # Project principles
│       ├── security-guidelines.md
│       ├── quality-standards.md
│       ├── context-state.md  # Session context
│       └── project-index.md  # This file
├── config/
│   └── electron-builder.yml  # Electron packaging config (canonical)
├── src/
│   ├── core/                 # Crypto + KDBX parser/serializer
│   ├── components/           # React UI
│   ├── stores/               # Zustand state
│   ├── storage/              # Renderer storage adapters
│   ├── main/                 # Electron main process
│   └── preload/              # Electron secure bridge
├── .github/workflows/
│   └── build.yml             # Windows build + release pipeline
├── LICENSE
└── package.json
```

---

## Domain Map

### Core Domain (`src/core/`)

**Purpose**: Framework-agnostic cryptographic engine and KDBX
4.x parser/serializer. Zero browser or Node.js dependencies.

**Subdomains**:
- `crypto/` - AES-256-CBC, SHA-256/512, HMAC-SHA-256 wrappers
- `kdf/` - Argon2id/Argon2d WASM bindings, AES-KDF
- `kdbx/` - KDBX 4.x binary format parser and serializer
- `model/` - Domain model (Database, Group, Entry, History)
- `generator/` - Password generation engine
- `utils/` - Binary utilities (UUID, Base64, little-endian)

**Key Constraints**:
- MUST use Web Crypto API for all standard crypto operations
- MUST be testable with NIST/RFC test vectors
- MUST NOT import any browser or Node.js-specific modules
- MUST support tree-shaking

### UI Domain (`src/components`, `src/hooks`, `src/stores`)

**Purpose**: React 18 web application providing the user interface.

**Subdomains**:
- `components/` - React components (Radix UI + Tailwind)
- `stores/` - Zustand state management
- `hooks/` - Custom React hooks
- `workers/` - Web Workers for off-thread crypto
- `storage/` - OPFS adapter for .kdbx persistence

**Key Constraints**:
- MUST NOT contain cryptographic logic (delegate to workers)
- MUST NOT block main thread > 16ms
- MUST follow Vercel React best practices
- MUST use Tailwind CSS + Radix UI for all UI elements
- Theme: Clean Enterprise SaaS (Strict Light Mode)

### Electron Domain (`src/main`, `src/preload`, `src/storage`) [ACTIVE]

**Purpose**: Electron desktop wrapper sharing web codebase.
Build pipeline enabled via `electron-vite`.

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Language | TypeScript | 5.x (strict) |
| Runtime | Browser (Web APIs) | ES2022+ |
| UI Framework | React | 18.x |
| Build Tool | Vite | 5.x |
| Styling | Tailwind CSS | 3.4.x |
| Components | Radix UI | Latest |
| State | Zustand | 4.x |
| Crypto | Web Crypto API | Native |
| KDF WASM | Argon2 (Rust→WASM) | TBD |
| Storage | OPFS | Native |
| Testing | Vitest | 3.x |
| Package Mgr | Bun | Latest |
| Desktop | electron-vite | 2.x |

---

## Architectural Patterns

### Crypto Pipeline
```
User Input → Master Password → SHA-256 composite →
  Argon2id KDF (WASM Worker) → Derived Key →
  HMAC-SHA-256 verification → AES-256-CBC decryption →
  GZip decompression → Inner header → XML parsing →
  Domain Model (Groups, Entries)
```

### Data Flow
```
UI Components → Zustand Store → Web Worker (postMessage) →
  core crypto/kdbx modules → renderer orchestration → Zustand Store →
  UI Components
```

### Storage Flow
```
Vault Model → @calix-pass/core (serialize KDBX) →
  Web Worker → OPFS (navigator.storage) →
  Persistent browser storage
```

---

## Conventions

- See `.specify/memory/quality-standards.md` for naming and coding
- See `.specify/memory/security-guidelines.md` for crypto rules
- See `.specify/memory/constitution.md` for project principles
