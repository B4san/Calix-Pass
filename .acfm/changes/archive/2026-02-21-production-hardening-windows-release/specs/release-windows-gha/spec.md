# Spec: Windows Build and GitHub Release Hardening

## functional_requirements

### ADDED Windows CI Build
The project MUST build and package Electron artifacts on `windows-latest` in
GitHub Actions using explicit npm scripts.

### ADDED Tag-driven Release Publishing
The workflow MUST publish release assets when a git tag matching `v*` is pushed.
Publishing MUST use the repository-provided `GITHUB_TOKEN`.

## technical_constraints

### ADDED Canonical Builder Configuration
Electron Builder configuration MUST be defined in a single canonical file at
`config/electron-builder.yml` and referenced by packaging scripts.

### ADDED Release Permissions
The GitHub Actions workflow MUST set `contents: write` permission for release
publishing.

## acceptance_criteria

### ADDED Windows Build Validation
- **GIVEN** a push to `main`
- **WHEN** workflow `build` runs
- **THEN** `npm run typecheck`, `npm run build`, and packaging steps complete
  on Windows.

### ADDED Release Validation
- **GIVEN** a tag like `v0.1.0`
- **WHEN** workflow executes
- **THEN** GitHub Release is created and includes generated installer assets.
