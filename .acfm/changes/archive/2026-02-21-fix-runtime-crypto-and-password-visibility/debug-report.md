# Systematic Debugging Report

## Phase 1: Root Cause Investigation

### Error A
- Symptom: `ReferenceError: crypto is not defined` al invocar `storage:createVault`.
- Reproduction: crear vault con contraseña maestra desde UI.
- Evidence: `src/main/index.ts` usaba `crypto.randomUUID()` sin import explícito en runtime main.
- Root cause: dependencia implícita en `globalThis.crypto` no garantizada en el contexto de Electron main.

### Error B
- Symptom: icono de ojo no visible en campos de contraseña.
- Reproduction: abrir diálogo de creación y desbloqueo.
- Evidence: estilos del botón del toggle con contraste bajo y clases genéricas; visibilidad dependía de estado de tema.
- Root cause: estilos visuales insuficientes para garantizar presencia perceptible del control.

## Phase 2: Pattern Analysis

- Working pattern esperado: funciones de runtime crítico (UUID) deben usar API de Node explícita.
- Working pattern UI: controles críticos deben tener contraste explícito, borde y estado hover/focus claros.

## Phase 3: Hypothesis and Testing

- Hypothesis 1: usar `randomUUID` importado desde `crypto` elimina el runtime error.
- Hypothesis 2: endurecer estilos del botón de toggle + habilitar toggle por defecto en `type=password` hace visible el ojo.

## Phase 4: Implementation and Verification

- Implemented:
  - módulo compartido `src/shared/security/masterPasswordPolicy.ts`.
  - `createVaultId()` con `randomUUID` de Node.
  - `Input` con toggle visible (borde, sombra, color explícitos).
  - suite `test:smoke` con Node test runner.
- Verification:
  - `npm run test:smoke` PASS.
  - `npm run typecheck` PASS.
  - `npm run build` PASS.

## Residual Risk

- Validación E2E visual completa requiere ejecución interactiva de la app en entorno gráfico.
