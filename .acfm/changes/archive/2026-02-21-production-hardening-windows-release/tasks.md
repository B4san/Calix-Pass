## Tasks

- [x] Create delta specs for Windows release pipeline and filesystem hardening.
- [x] Consolidate Electron Builder configuration into `config/electron-builder.yml`.
- [x] Update `package.json` scripts and metadata for production packaging.
- [x] Harden `.github/workflows/build.yml` for Windows build + tagged release.
- [x] Implement main-process filesystem validation and export-write IPC.
- [x] Update renderer filesystem adapter and export flow usage in `src/App.tsx`.
- [x] Remove unconditional no-sandbox startup switches from Electron main.
- [x] Run verification commands (`npm run typecheck`, `npm run build`) and
      document packaging limitation in this environment.
- [x] Reconcile spec/task status notes for missing/non-blocking features from
      `.acfm` and `.specify`.
