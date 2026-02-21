## Context

The current app supports soft delete into Recycle Bin but misses core lifecycle
operations (restore/permanent delete/empty bin). Additionally, initial vault setup
starts from a blank structure and vault picker lacks filtering, which slows usage
for power users with multiple vaults.

## Goals

1. Make Recycle Bin fully usable without leaving the main flow.
2. Speed up onboarding with practical project/group scaffolding.
3. Improve scalability of vault picker for many vault files.

## Non-Goals

- No changes to cryptographic or KDBX wire formats.
- No sync/cloud feature implementation.
- No changes to authentication model.

## Design Decisions

### Decision: Context-aware delete actions
- **Approach:** In Recycle Bin context, UI exposes `Restore` and `Delete permanently`;
  outside Recycle Bin, delete remains soft-delete to Recycle Bin.
- **Rationale:** Users need safe defaults plus explicit hard-delete path.
- **Alternatives considered:** Add separate global trash manager screen; deferred to
  keep interaction lightweight.

### Decision: Restore target defaults to root group
- **Approach:** Restored entries/groups return to root group.
- **Rationale:** Simple, deterministic behavior without extra metadata migration.
- **Alternatives considered:** Store original parent metadata in database custom data;
  deferred for now.

### Decision: Starter project groups as opt-in default
- **Approach:** Create Vault dialog includes checkbox for starter groups, enabled by
  default.
- **Rationale:** Most users benefit immediately, but advanced users can opt out.
- **Alternatives considered:** wizard flow; rejected as heavier UI.

### Decision: Client-side vault picker filtering
- **Approach:** local filter input over already loaded vault metadata.
- **Rationale:** No new IPC/APIs needed and instant response.
- **Alternatives considered:** IPC-backed search; unnecessary complexity.

## Architecture

State-driven flow:
- `vaultStore` adds recycle-bin lifecycle actions:
  - `restoreEntry`, `restoreGroup`,
  - `permanentlyDeleteEntry`, `permanentlyDeleteGroup`,
  - `emptyRecycleBin`.
- `DetailPanel` and `Sidebar` switch action sets based on Recycle Bin context.
- `CreateVaultDialog` passes `createStarterGroups` flag to `createVault`.
- `VaultPicker` applies local filtered view over vault metadata list.
