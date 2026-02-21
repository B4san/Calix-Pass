# Spec: Desktop Filesystem Hardening

## functional_requirements

### ADDED Vault Identifier Validation
Filesystem IPC handlers that read/write/delete vault files MUST reject invalid
vault identifiers.

### ADDED Explicit Export Write
The desktop application MUST persist exported vault bytes to the user-selected
destination through a main-process write handler.

### ADDED Metadata Consistency
Vault metadata (`lastAccessedAt`) MUST be updated and persisted when vaults are
opened or written.

## technical_constraints

### ADDED Safe Path Construction
Vault paths MUST be built from validated identifiers and controlled extensions to
avoid path traversal risks.

### ADDED Error Surface
Filesystem operation failures MUST return actionable, non-sensitive errors.

## acceptance_criteria

### ADDED Validation Behavior
- **GIVEN** an invalid vault identifier from renderer IPC
- **WHEN** a read/write/delete operation is invoked
- **THEN** the operation fails with validation error and no file operation occurs.

### ADDED Export Behavior
- **GIVEN** an opened vault and selected export destination
- **WHEN** export is confirmed
- **THEN** a `.kdbx` file is written to the selected destination and success
  feedback is shown.
