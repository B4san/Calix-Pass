# Calix Pass

Calix Pass is a local-first password manager built with Electron, React, and
TypeScript, with KDBX-compatible vault parsing and serialization.

## Development

```bash
npm ci
npm run dev
```

## Quality Checks

```bash
npm run typecheck
npm run build
```

## Windows Packaging

```bash
npm run package:win
```

Builder configuration is centralized at `config/electron-builder.yml`.

## GitHub Actions Release Flow

- Pushes/PRs to `main` run Windows build validation.
- Tags in format `v*` (example: `v0.1.0`) trigger release publishing.
- Release assets are uploaded to GitHub Releases using `GITHUB_TOKEN`.

## Project Structure

- `src/main`: Electron main process (filesystem and IPC)
- `src/preload`: secure renderer bridge
- `src/storage`: renderer-side storage adapters
- `src/core`: crypto, KDBX, and domain model logic
- `.acfm`: spec-driven workflow artifacts
- `.specify/memory`: governance and requirements memory
