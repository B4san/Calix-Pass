# Spec: Vault UX Polish for Multi-Project Usage

## functional_requirements

### ADDED Starter Project Groups
Create Vault flow MUST support optional starter groups for common organization
patterns (Personal, Work, Projects, Finance).

### ADDED Vault Picker Filter
Vault picker MUST allow filtering vaults by name.

## technical_constraints

### ADDED Backward Compatibility
Existing vault creation behavior MUST continue to work when starter groups are
disabled.

### ADDED Local Filtering
Vault filtering MUST be implemented client-side over loaded vault metadata.

## acceptance_criteria

### ADDED Starter Groups
- **GIVEN** user creates vault with starter groups enabled
- **WHEN** vault opens
- **THEN** root contains starter groups plus Recycle Bin.

### ADDED Picker Filter
- **GIVEN** user has multiple vaults
- **WHEN** they type in filter input
- **THEN** displayed list updates to matching vault names only.
