# Spec: Vault Creation Reliability

## functional_requirements

### MODIFIED Transaction-Like Creation Flow
La creación de vault MUST evitar estado parcial (metadata creada sin archivo `.kdbx`).

### MODIFIED Error Propagation
Errores de backend/serialización MUST propagarse con mensaje útil al usuario.

## technical_constraints

### ADDED Rollback On Failure
Si falla la escritura de datos del vault, el backend MUST revertir metadata del vault
recién creada.

## acceptance_criteria

### ADDED No Orphan Metadata
- **GIVEN** un fallo durante escritura del vault
- **WHEN** finaliza la operación
- **THEN** el vault no aparece en `vaults.json`.

### ADDED Helpful Errors
- **GIVEN** un error de creación
- **WHEN** UI captura excepción
- **THEN** muestra texto específico y no mensaje genérico.
