## Why

Calix Pass already has a solid base, but key usability gaps remain versus modern
password manager expectations:
- Recycle Bin lacks full lifecycle actions (restore and permanent delete).
- New users need faster organization for multiple areas/projects.
- Vault selection UX can be improved for users with many vaults.

These are functional polish items (not crypto/security) that improve day-1 and
day-30 experience for real users.

## What Changes

1. Complete Recycle Bin behavior:
- restore entries/groups from Recycle Bin;
- permanent delete actions from Recycle Bin;
- empty Recycle Bin action.

2. Add project-oriented onboarding at vault creation:
- optional starter group templates (Personal, Work, Projects, Finance).

3. Improve multi-vault usability:
- vault picker quick search/filter by vault name.

## Capabilities

### New Capabilities
- `recycle-bin-restore`: Restore entry/group from Recycle Bin to root.
- `recycle-bin-empty`: Empty Recycle Bin in one action.
- `vault-starter-project-groups`: Create starter groups automatically in new vaults.
- `vault-picker-filter`: Filter vault list by name in picker UI.

### Modified Capabilities
- `entry-crud`: Deletion and management flow now distinguishes soft delete and
  permanent delete based on Recycle Bin context.
- `group-crud`: Group delete semantics now support restore/permanent paths.

## Impact

- **Files**:
  - `src/stores/vaultStore.ts`
  - `src/components/layout/DetailPanel.tsx`
  - `src/components/layout/Sidebar.tsx`
  - `src/components/vault/UnlockDialog.tsx`
  - `src/components/vault/VaultPicker.tsx`
  - `src/App.tsx`
- **User impact**:
  - better recovery flows (fewer accidental data loss cases);
  - faster initial organization for project-separated usage;
  - easier navigation with many vault files.
