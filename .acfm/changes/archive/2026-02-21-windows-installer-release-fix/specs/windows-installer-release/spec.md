# Spec: Windows Installer and Release Visibility

## functional_requirements

### ADDED Installer Artifact
CI MUST produce a Windows NSIS setup executable suitable for guided installation.

### ADDED Nightly Release Visibility
Pushes to `main` MUST publish/update a `nightly` prerelease with the latest
installer asset.

### ADDED Stable Tag Release
Tags matching `v*` MUST create a stable GitHub Release with installer assets.

## technical_constraints

### ADDED Installer-first Target
Default Windows packaging target MUST be `nsis`.

## acceptance_criteria

### ADDED Main Push Release
- **GIVEN** a push to `main`
- **WHEN** workflow completes
- **THEN** a `nightly` prerelease appears in GitHub Releases with setup `.exe`.

### ADDED Tag Release
- **GIVEN** a pushed tag `vX.Y.Z`
- **WHEN** workflow completes
- **THEN** a stable release appears with setup `.exe`.
