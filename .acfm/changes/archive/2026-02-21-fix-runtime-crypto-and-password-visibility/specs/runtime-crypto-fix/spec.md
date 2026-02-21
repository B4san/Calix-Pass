# Spec: Runtime Crypto Fix

## functional_requirements

### ADDED Node Crypto UUID
El proceso main MUST generar IDs usando API de Node `crypto` explícita compatible con runtime de Electron.

## acceptance_criteria

### ADDED Vault Creation Runtime
- **GIVEN** usuario crea vault
- **WHEN** backend genera ID
- **THEN** no ocurre `ReferenceError: crypto is not defined`.
