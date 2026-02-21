## Context

El flujo actual crea metadata del vault y luego escribe `.kdbx` desde renderer,
con validación mínima local. Si algo falla, la UI muestra error genérico y puede
quedar estado inconsistente. Además, se importa Google Fonts, bloqueado por CSP.

## Goals

1. Hacer confiable el flujo de creación de vault.
2. Aplicar validación fuerte de contraseña en backend con mensajes claros.
3. Mejorar UI de onboarding/create/unlock según referencia visual.

## Non-Goals

- No cambiar formato KDBX.
- No rediseñar todas las vistas internas de gestión de entradas.
- No introducir dependencias externas de UI.

## Design Decisions

### Decision: Backend password policy endpoint
- **Approach:** agregar IPC `security:validateMasterPassword` y reutilizar validación
  interna también en `storage:createVault`.
- **Rationale:** autoridad en backend evita bypass desde renderer.

### Decision: Rollback metadata on write failure
- **Approach:** al crear vault en `vaultStore`, si falla escritura de datos se invoca
  borrado del vault meta recién creado.
- **Rationale:** evita vaults huérfanos visibles sin archivo válido.

### Decision: Specific error surfacing
- **Approach:** mostrar mensaje de error real (`Error.message`) en dialogs de unlock/create.
- **Rationale:** acelera diagnóstico y mejora UX.

### Decision: CSP-safe typography + reference layout
- **Approach:** remover `@import` remoto, usar stack local (`Segoe UI`, `system-ui`) y
  actualizar layouts/cards/dialog a estilo clean SaaS de la referencia.
- **Rationale:** elimina warning CSP y mejora percepción de producto.

## Architecture

- Main process (`src/main/index.ts`)
  - `validateMasterPasswordStrength(password)`
  - `ipcMain.handle('security:validateMasterPassword', ...)`
  - endurecer `handleCreateVault` para validar contraseña cuando se provee.
- Preload + storage bridge
  - nueva API `validateMasterPassword`.
  - `createVault(name, password?)` compatible.
- Renderer
  - `CreateVaultDialog` usa validación backend preventiva y toggle de visibilidad.
  - `UnlockDialog` añade toggle de visibilidad.
  - `VaultStore.createVault` agrega rollback (`deleteVault`) al fallar escritura.
- UI/Styles
  - `src/index.css`, `tailwind.config.js`, `VaultPicker`, `App` y `Dialog/Input`
    refinados para layout profesional y consistente.
