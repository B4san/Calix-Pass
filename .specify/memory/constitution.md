<!--
Sync Impact Report
==================
Version change: N/A → 1.0.0
Modified principles: N/A (initial creation)
Added sections: All (initial constitution)
Removed sections: None
Templates requiring updates: N/A (no templates exist yet)
Follow-up TODOs: None
-->

# Calix Pass - Project Constitution

**Version**: 1.0.0
**Ratification Date**: 2026-02-19
**Last Amended Date**: 2026-02-19
**Author**: Sebastian Flores Peralta
**License**: MIT

---

## Preamble

Calix Pass is an open-source, modern password manager built as a
web-first application with Electron desktop support. It implements
full KDBX 4.x compatibility to serve as a contemporary alternative
to KeePass, prioritizing cryptographic rigor, local-first data
sovereignty, and an intuitive user experience. This constitution
defines the non-negotiable principles that govern all technical
decisions, code contributions, and architectural evolution of the
project.

---

## Principle 1: Cryptographic Integrity Above All

The security of user credentials is the project's existential
purpose. Every architectural decision MUST be evaluated first
through the lens of cryptographic correctness.

- All encryption MUST use audited, standardized algorithms
  (AES-256-CBC, ChaCha20, SHA-256/512, HMAC-SHA-256, Argon2id).
- Cryptographic operations MUST NOT be implemented from scratch;
  they MUST use Web Crypto API (hardware-backed) or audited WASM
  modules compiled from established Rust/C libraries.
- Key material MUST never persist in plaintext storage (memory,
  disk, logs, or developer console).
- Sensitive buffers MUST be zeroed immediately after use.
- No cryptographic parameter (key size, iteration count, memory
  cost) MUST be hardcoded below industry-recommended minimums.

**Rationale**: A password manager with flawed cryptography is worse
than no password manager. Users entrust their entire digital
identity to this software.

---

## Principle 2: KDBX 4.x Format Fidelity

Calix Pass MUST maintain full read/write compatibility with the
KDBX 4.x file format as implemented by KeePass 2.x and KeePassXC.

- Files created by Calix Pass MUST be openable by KeePass 2.x
  and KeePassXC without data loss.
- Files created by KeePass 2.x and KeePassXC MUST be openable by
  Calix Pass without data loss.
- The KDBX parser/serializer MUST be validated against reference
  .kdbx test files from multiple KeePass implementations.
- Format deviations MUST be documented and justified in the
  specification.

**Rationale**: Format compatibility eliminates vendor lock-in and
allows users to migrate seamlessly. It also enables validation
against battle-tested implementations.

---

## Principle 3: Local-First Data Sovereignty

User data MUST remain under the user's exclusive control at all
times. No server, cloud service, or third party is required for
core functionality.

- The application MUST function fully offline with zero network
  dependencies for vault operations.
- All data storage in web mode MUST use Origin Private File
  System (OPFS) within the browser sandbox.
- No telemetry, analytics, or usage tracking MUST be included.
- Cloud sync (when implemented) MUST be opt-in, user-initiated,
  and use the user's own cloud storage accounts.

**Rationale**: Centralizing passwords in third-party infrastructure
creates catastrophic single points of failure. Users who choose
local storage are making a deliberate security decision that the
software MUST respect unconditionally.

---

## Principle 4: Web-First, Desktop-Ready Architecture

The application MUST be built as a fully functional web application
first, with Electron desktop support added as a secondary target
sharing the same codebase.

- The monorepo MUST separate framework-agnostic core logic
  (`@calix-pass/core`) from UI (`@calix-pass/web`) and desktop
  (`@calix-pass/electron`) packages.
- The core cryptographic and KDBX engine MUST have zero browser or
  Node.js-specific dependencies; it MUST run in any JavaScript
  runtime supporting Web Crypto API.
- UI components MUST NOT contain business logic or cryptographic
  operations.
- All heavy cryptographic operations MUST run in Web Workers to
  keep the main thread responsive.

**Rationale**: Clean separation enables code reuse across platforms,
independent testing of the crypto engine, and future portability
to mobile or CLI targets.

---

## Principle 5: TypeScript Strictness as Safety Net

All code MUST be written in TypeScript with strict mode enabled.
The type system serves as a compile-time safety net for a project
where runtime errors can mean data loss.

- `strict: true` MUST be enabled in all tsconfig.json files.
- `any` type MUST NOT be used except in type assertion bridges
  with third-party libraries, and each use MUST include a comment
  explaining why.
- All public APIs MUST have explicit return types.
- Binary data structures (KDBX headers, blocks) MUST be modeled
  with branded types or opaque type wrappers to prevent
  accidental misuse.

**Rationale**: In cryptographic code, a mistyped buffer or swapped
parameter can silently produce invalid ciphertext. TypeScript's
type system catches these errors before they reach users.

---

## Principle 6: Test-Driven Cryptographic Validation

All cryptographic operations and KDBX format handling MUST be
validated by automated tests using known-answer test vectors
before any code is merged.

- Unit tests MUST cover every cipher, KDF, hash, and HMAC
  function with NIST/RFC test vectors.
- Integration tests MUST verify KDBX round-trip (parse, modify,
  serialize, re-parse) with reference .kdbx files.
- The password generator MUST be tested for entropy distribution
  and charset coverage.
- Test coverage for `@calix-pass/core` MUST be maintained above
  90%.
- Vitest MUST be used as the test framework.

**Rationale**: Cryptographic code cannot be verified by code review
alone. Automated tests with known-answer vectors provide
mathematical proof of correctness.

---

## Principle 7: Modern, Accessible User Interface

The UI MUST follow modern design principles with full accessibility
compliance, providing a dramatically better experience than
KeePass's native desktop interface.

- The design language MUST follow the specification: 3-column
  layout, rounded containers, Inter font, blue accent (#2563EB),
  clean card-based components.
- All interactive elements MUST be keyboard-navigable.
- All components MUST meet WCAG 2.1 AA contrast ratios.
- Tailwind CSS MUST be used for styling, Radix UI for accessible
  primitives.
- Zustand MUST be used for state management.
- No UI component MUST block the main thread for more than 16ms.

**Rationale**: KeePass's primary weakness is its dated UI. Calix
Pass differentiates by proving that maximum security and excellent
UX are not mutually exclusive.

---

## Principle 8: Zero Tolerance for Secrets in Code

No cryptographic key, password, API token, or sensitive
configuration value MUST ever appear in source code, configuration
files committed to version control, or build artifacts.

- `.env` files MUST be listed in `.gitignore`.
- Test vectors MUST use well-known published values (NIST, RFC),
  never production secrets.
- CI/CD secrets MUST use GitHub Actions encrypted secrets.
- Pre-commit hooks SHOULD scan for accidental secret commits.

**Rationale**: A single leaked secret in a password manager's
source code would undermine all user trust irreversibly.

---

## Governance

### Amendment Procedure

1. Proposed changes MUST be documented with rationale.
2. The constitution version MUST be incremented following semantic
   versioning:
   - MAJOR: Principle removal or redefinition.
   - MINOR: New principle added or existing one materially
     expanded.
   - PATCH: Clarification, wording, or typo fixes.
3. All amendments MUST update the `Last Amended Date` field.

### Compliance Review

- Every pull request MUST be evaluated against these principles.
- If a PR conflicts with any principle, the principle takes
  precedence unless an amendment is ratified first.
- Code reviews MUST include a constitution compliance check for
  any changes touching cryptography, data storage, or
  authentication flows.

### Technology Stack (Locked for MVP)

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Language | TypeScript (strict) | Type safety for crypto code |
| Frontend | React 19 + Vite | Largest ecosystem, Electron compat |
| Styling | Tailwind CSS 4 + Radix UI | Utility-first + accessible primitives |
| State | Zustand | Minimal boilerplate, atomic updates |
| Crypto | Web Crypto API + WASM | Hardware-backed + Argon2 support |
| Storage | OPFS | Private, performant browser storage |
| Desktop | electron-vite | Shared codebase with web |
| Package Mgr | Bun | Fast, TypeScript-first |
| Testing | Vitest | Vite-native, fast |
| Format | KDBX 4.x | Interoperability with KeePass |
| Repo | Monorepo (Bun workspaces) | Clean package separation |
