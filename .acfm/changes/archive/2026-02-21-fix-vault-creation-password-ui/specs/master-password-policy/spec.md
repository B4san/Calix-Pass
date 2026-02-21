# Spec: Master Password Policy

## functional_requirements

### ADDED Backend Strength Validation
El backend MUST validar contraseña maestra antes de crear vault.

### ADDED Specific Rule Errors
El backend MUST devolver errores específicos por cada regla incumplida:
- longitud mínima;
- falta de mayúsculas;
- falta de minúsculas;
- falta de números;
- falta de caracteres especiales.

## technical_constraints

### ADDED Server-Side Authority
La validación de fortaleza MUST ejecutarse en proceso main (backend de Electron),
no solo en renderer.

## acceptance_criteria

### ADDED Weak Password Rejection
- **GIVEN** una contraseña sin mayúsculas o sin especiales
- **WHEN** usuario intenta crear vault
- **THEN** creación se bloquea
- **AND** UI muestra mensaje específico de regla faltante.
