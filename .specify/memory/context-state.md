## Project Context Summary

> Updated 2026-02-21 during production hardening pass.

**Project**: Calix Pass
**Last Updated**: 2026-02-21
**Session**: Production hardening for Windows build/release

### Current State

**Active Changes**: None

**Archived in this pass**:
1. `2026-02-21-mvp-core-vault`
2. `2026-02-21-production-hardening-windows-release`
3. `2026-02-21-ux-polish-recycle-bin-projects`

**Architecture Overview**:
- Monorepo with Bun workspaces
- Three packages: @calix-pass/core, @calix-pass/web, @calix-pass/electron
- TypeScript strict mode throughout
- Web Crypto API + WASM (Argon2) for cryptography
- KDBX 4.x file format compatibility
- React 19 + Vite for UI
- Tailwind CSS 4 + Radix UI for design system
- Zustand for state management
- OPFS for browser-side storage
- Vitest for testing

**Technology Decisions**:
1. React + Vite (not Next.js) - no SSR needed for local-first app
2. Web Crypto API for hardware-backed crypto + WASM for Argon2
3. OPFS for .kdbx storage in browser sandbox
4. KDBX 4.x format for KeePass interoperability
5. Bun as package manager (fast, TypeScript-first)
6. electron-vite for desktop wrapper (later phase)

### Project Governance

**Constitution**: `.specify/memory/constitution.md` - 8 principles defined
**Security**: `.specify/memory/security-guidelines.md` - threat model + controls
**Quality**: `.specify/memory/quality-standards.md` - TS strict, naming, testing

### MVP Scope (Core Vault)

**Included**:
- Create/Open KDBX 4.x vaults
- Master password authentication
- AES-256-CBC encryption + Argon2id KDF
- HMAC-SHA-256 integrity (Encrypt-then-MAC)
- Entry CRUD + Group hierarchy
- Search, Password generator, Clipboard management
- Entry history, OPFS persistence
- File import/export, Modern 3-column UI

**Deferred**: Key files, ChaCha20, Twofish, TOTP, Auto-Type,
browser extension, cloud sync, triggers, plugin system, Electron

### Key Files

- `.acfm/config.yaml` - Spec workflow configuration
- `.specify/memory/constitution.md` - Project constitution
- `.specify/memory/security-guidelines.md` - Security guidelines
- `.specify/memory/quality-standards.md` - Quality standards
- `LICENSE` - MIT License

### Next Steps

1. Create project-index.md
2. Research KDBX 4.x format and existing libraries
3. Explore architecture via openspec-explore
4. Run brainstorming to surface all questions
5. Create openspec change for MVP
