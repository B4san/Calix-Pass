## Why

Current CI output is confusing for end users:
- artifacts are uploaded as generic `windows-build` bundles;
- Releases are only created on `v*` tags, so normal pushes do not show installer in Releases;
- users expect a classic Windows setup executable with install wizard.

## What Changes

- Force Windows packaging to produce a clear NSIS installer executable (`Setup.exe`).
- Upload installer artifacts with explicit naming.
- Publish release assets in two modes:
  - stable release on version tags (`v*`);
  - rolling prerelease (`nightly`) on `main` pushes.

## Capabilities

### New Capabilities
- `windows-nightly-release`: automatic prerelease with installer attached on `main`.
- `windows-installer-artifacts`: CI artifact explicitly contains NSIS installer executable.

### Modified Capabilities
- `release-windows-gha`: release visibility improved by adding non-tag release channel.
- `desktop-build`: packaging target standardized to installer-first distribution.

## Impact

- `config/electron-builder.yml`
- `.github/workflows/build.yml`
- `package.json`
