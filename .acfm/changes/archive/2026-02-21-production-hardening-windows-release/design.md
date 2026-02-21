## Context

The app currently compiles successfully, but packaging and release readiness are
not fully hardened:
- Builder configuration exists in multiple places (`package.json` and root yaml).
- Runtime contains a development no-sandbox toggle applied unconditionally.
- Desktop export flow prompts for a file path but does not write data from the
  renderer side.
- Filesystem operations trust incoming IDs too much.

## Goals

1. Produce deterministic Windows packaging and release behavior in GitHub Actions.
2. Ensure filesystem operations are validated and safe by default.
3. Keep current user-facing workflows intact while removing production risks.
4. Keep changes small and focused to avoid broad regressions.

## Non-Goals

- Full monorepo migration to `packages/*` in this change.
- Rewriting crypto stack or parser implementation.
- Implementing every deferred MVP feature from historical task docs.

## Design Decisions

### Decision: Single canonical builder config
- **Approach:** Move builder configuration into `config/electron-builder.yml` and
  point npm packaging scripts to that file.
- **Rationale:** Avoid drift between multiple build definitions and make CI/local
  invocations explicit.
- **Alternatives considered:**
  - Keep config in `package.json`: rejected due mixed concerns and less visibility.
  - Keep root `electron-builder.yml`: acceptable but keeps root clutter.

### Decision: Harden filesystem boundary in main process
- **Approach:** Add identifier validation (`UUID` shape), guarded path usage, and
  centralized export-write handler in Electron main.
- **Rationale:** Renderer input is untrusted boundary data even in local apps.
- **Alternatives considered:**
  - Trust UI-generated IDs only: rejected, brittle and unsafe.

### Decision: Production-default sandbox behavior
- **Approach:** Remove unconditional command-line sandbox bypass.
- **Rationale:** Bypass is only useful in constrained dev environments and should
  never be default production behavior.
- **Alternatives considered:**
  - Keep current behavior: rejected due reduced security baseline.
  - Condition by env var only: deferred, can be added later if needed.

### Decision: Tag-driven release job with artifact handoff
- **Approach:** Windows build job produces artifacts; release job runs only for
  `refs/tags/v*` and publishes downloaded artifacts with `GITHUB_TOKEN`.
- **Rationale:** Clear separation between build validation and release publishing.
- **Alternatives considered:**
  - Let electron-builder auto-publish from build step: workable, but less explicit
    control over release policy and metadata in this repository state.

## Architecture

High-level flow after change:

1. `npm run build` compiles main/preload/renderer via `electron-vite`.
2. `npm run package:win` invokes electron-builder with explicit config file.
3. GitHub Actions (Windows) runs typecheck/build/package and uploads artifacts.
4. GitHub Actions (Ubuntu release job) downloads artifacts and creates release on tags.
5. App export flow:
   - Renderer requests export data + prompts for destination;
   - Renderer calls main `writeExportFile(path, data)` IPC;
   - Main validates destination and writes bytes with `fs.writeFile`.
