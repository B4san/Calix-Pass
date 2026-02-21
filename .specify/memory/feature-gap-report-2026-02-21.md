# Feature Gap Report — 2026-02-21

## Scope Reviewed

- `.acfm/changes/mvp-core-vault/tasks.md`
- `.acfm/specs/*`
- `.specify/memory/*.md`
- current implementation under `src/`

## Implemented in This Hardening Pass

- Windows build/release pipeline hardened and aligned for GitHub Actions tags.
- Canonical Electron Builder config moved to `config/electron-builder.yml`.
- Filesystem IPC hardening:
  - vault identifier validation,
  - secure export file write path,
  - metadata persistence updates on read/write.
- Removed unconditional no-sandbox startup override in Electron main process.
- Recycle Bin behavior improved:
  - default Recycle Bin group creation in new databases,
  - entry/group deletion now moves to Recycle Bin when available,
  - restore entry/group from Recycle Bin,
  - permanent delete from Recycle Bin,
  - empty Recycle Bin action.
- UX polish:
  - starter project groups on vault creation (Personal/Work/Projects/Finance),
  - vault picker filter for multi-vault usage.

## Remaining Gaps (Non-Blocking for Windows Production Packaging)

- Dedicated worker bridge and full crypto worker split (`src/workers`).
- KDBX compatibility reference fixture suite (KeePassXC round-trip tests).
- Attachment/custom icon read-only UI exposure is partial.
- Recycle Bin restore target is root group (original parent tracking not yet persisted).
- E2E/integration automation coverage remains limited.

## Production Readiness Position

Current state is suitable for Windows CI packaging and GitHub release automation,
with core filesystem correctness improved. Remaining gaps are feature-depth and
test breadth items, not blockers for generating installable desktop releases.
