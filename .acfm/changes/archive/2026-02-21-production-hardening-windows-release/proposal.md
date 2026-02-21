## Why

The repository is functional but not production-hardened. There are mismatches
between documented architecture and actual layout, CI is missing hardening for
Windows release packaging, and filesystem flows include correctness gaps (notably
export path handling and weak runtime validation around file identifiers).

This change standardizes production build/release behavior and reduces the risk of
filesystem corruption or accidental misuse while preserving current app behavior.

## What Changes

1. Normalize project build/release configuration:
- centralize Electron Builder configuration in a dedicated config path;
- remove duplicate config definitions;
- harden GitHub Actions workflow for Windows package + GitHub Release.

2. Harden Electron filesystem and IPC boundary:
- add strict vault ID validation;
- normalize and validate vault names used for export;
- implement explicit file export write flow through main process;
- ensure metadata updates are persisted correctly.

3. Remove development-only sandbox bypass in main process:
- no unconditional `--no-sandbox` switch for packaged production behavior.

4. Align OpenSpec artifacts with the real repository state and track remaining
feature gaps that are non-blocking for production packaging.

## Capabilities

### New Capabilities
- `release-windows-gha`: Produce signed/unsigned Windows artifacts in GitHub
  Actions and publish release assets from tag builds using `GITHUB_TOKEN`.
- `vault-export-write`: Export vault binaries to user-selected location via
  Electron main process with validation and explicit error handling.
- `vault-id-validation`: Enforce UUID-shaped vault IDs for IPC operations that
  access the filesystem.

### Modified Capabilities
- `desktop-build`: Build/publish flow now uses one canonical builder config and
  validated CI stages (typecheck, build, package, release upload).
- `filesystem-io`: Metadata and access timestamps are updated consistently during
  open/write operations.

## Impact

- **Code impact**:
  - `.github/workflows/build.yml`
  - `package.json`
  - `src/main/index.ts`
  - `src/storage/electron.ts`
  - `src/App.tsx`
  - `.gitignore`
  - `config/electron-builder.yml` (new)
- **Systems affected**:
  - Windows packaging pipeline
  - GitHub release automation
  - Desktop filesystem interaction layer
- **Risk reduction**:
  - prevents invalid vault identifier path usage;
  - fixes export flow reliability;
  - removes non-production sandbox bypass behavior from default runtime.
