## Why

Usuarios reportan que la creación de vault falla después de seleccionar carpeta y definir
contraseña maestra. Además, la UI actualmente tiene una advertencia CSP por carga de
fuente externa bloqueada y no ofrece feedback sólido de seguridad de contraseña.

Esto impacta el flujo crítico de onboarding (crear primer vault) y la confianza del usuario.

## What Changes

1. Corregir el flujo de creación de vault para que sea transaccional y con errores
   explícitos (sin estados parciales).
2. Validar fortaleza de contraseña maestra en backend con reglas y mensajes específicos.
3. Exponer en UI la opción mostrar/ocultar contraseña maestra (icono de ojo).
4. Eliminar dependencia de Google Fonts bloqueada por CSP.
5. Mejorar visualmente pantallas de entrada (folder/vault/create/unlock) tomando como
   referencia la composición de `UI/original-2373c6ffda64e8fa11501912ada8f76c.webp`.

## Capabilities

### New Capabilities
- `master-password-policy`: Validación backend de contraseña maestra con errores
  detallados por regla incumplida.

### Modified Capabilities
- `vault-creation-reliability`: Creación de vault robusta con mejor manejo de errores y
  rollback cuando falle la escritura.
- `entry-flow-ui-polish`: UI de onboarding y creación/unlock más profesional,
  incluyendo visibilidad de contraseña y layout refinado.

## Impact

- **Files**:
  - `src/main/index.ts`
  - `src/preload/index.ts`
  - `src/preload/index.d.ts`
  - `src/storage/electron.ts`
  - `src/stores/vaultStore.ts`
  - `src/components/vault/UnlockDialog.tsx`
  - `src/components/common/Input.tsx`
  - `src/components/vault/VaultPicker.tsx`
  - `src/App.tsx`
  - `src/index.css`
  - `tailwind.config.js`
- **User impact**:
  - puede crear vault sin fallo silencioso;
  - recibe error claro si la contraseña maestra no cumple seguridad;
  - experiencia visual más consistente y profesional.
