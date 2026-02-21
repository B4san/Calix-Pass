## Why

Persisten dos fallos críticos post-release:
1. `Error invoking remote method 'storage:createVault': ReferenceError: crypto is not defined`.
2. Falta de visibilidad del icono de mostrar contraseña en flujo de master password.

Estos bloquean y degradan el flujo principal de creación de vault.

## What Changes

1. Corregir generación de UUID en backend main para no depender de `globalThis.crypto`.
2. Hacer visible y consistente el toggle de ojo en campos de contraseña.
3. Añadir pruebas automatizadas de política de contraseña y generación de IDs.

## Capabilities

### Modified Capabilities
- `vault-creation-reliability`: elimina dependencia runtime inválida en main.
- `master-password-policy`: pruebas automatizadas de reglas y mensajes.
- `entry-flow-ui-polish`: toggle de contraseña visible y consistente.

## Impact

- `src/main/index.ts`
- `src/components/common/Input.tsx`
- `src/shared/security/masterPasswordPolicy.ts` (new)
- `tests/security.test.ts` (new)
- `tests/tsconfig.test.json` (new)
- `package.json`
