## Context

El error runtime proviene de uso directo de `crypto.randomUUID()` en main, dependiente de disponibilidad global. Debe usarse import explícito de Node crypto.

## Decision

1. Extraer lógica de seguridad a módulo compartido:
   - `validateMasterPasswordStrength`.
   - `createVaultId` con `randomUUID` de Node.
2. Reusar módulo en main e instrumentar pruebas con Node test runner.
3. Endurecer clases del botón ojo para que sea visible (color/outline explícitos).

## Test Strategy

- Unit tests de módulo de seguridad (reglas positivas/negativas + UUID pattern).
- Verificación build/typecheck + smoke tests.
