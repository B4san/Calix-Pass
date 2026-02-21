# Spec: Recycle Bin Lifecycle UX

## functional_requirements

### ADDED Restore Entry and Group
Users MUST be able to restore entries and groups from Recycle Bin.

### ADDED Permanent Delete
Users MUST be able to permanently delete entries and groups from Recycle Bin.

### ADDED Empty Recycle Bin
Users MUST be able to empty the entire Recycle Bin with confirmation.

## technical_constraints

### ADDED Safe Defaults
Delete operations outside Recycle Bin MUST remain soft-delete behavior.

### ADDED Deterministic Restore Target
Restore operations MUST move items to root group if original parent tracking is
not available.

## acceptance_criteria

### ADDED Restore Flow
- **GIVEN** an entry/group in Recycle Bin
- **WHEN** user selects restore
- **THEN** item appears in root group and disappears from Recycle Bin.

### ADDED Permanent Delete Flow
- **GIVEN** an entry/group in Recycle Bin
- **WHEN** user selects permanent delete and confirms
- **THEN** item is removed from vault data and cannot be restored.
