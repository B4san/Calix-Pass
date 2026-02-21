## Context

The app builds, but distribution UX is not aligned with user expectations. End
users want a direct installer with wizard and a visible GitHub Release entry.

## Goals

1. Produce NSIS setup installer as primary Windows artifact.
2. Make installer discoverable in GitHub Releases even without manual tagging.
3. Keep stable tag-based release flow intact.

## Non-Goals

- No code changes in application runtime.
- No signing certificate integration in this pass.

## Design Decisions

### Decision: NSIS-only target for default pipeline
- **Approach:** Build only `nsis` target in builder config.
- **Rationale:** Avoid confusion between portable and installer artifacts.
- **Alternatives considered:** keep portable + nsis; rejected for user confusion.

### Decision: Dual release channel
- **Approach:** Keep stable release on `v*` tags, add `nightly` prerelease on
  pushes to `main`.
- **Rationale:** Users can always download latest installer from Releases.
- **Alternatives considered:** tags only; rejected due low discoverability.

## Architecture

- Build job (Windows): `npm ci` → `typecheck` → `build` → `package:win`.
- Upload installer artifact with explicit name and file pattern.
- Release jobs:
  - `release_tag`: tag-triggered stable release.
  - `release_nightly`: main-branch prerelease with `tag_name: nightly`.
