## Why

El usuario reporta que la barra lateral de vaults (All/Recent/Favorites/Shared/Tags)
no realiza ninguna acción. Además, la UI usa iconografía inconsistente con estilo
SaaS profesional, y el formulario de entradas no soporta tipos específicos
(password, SSH, card, etc.).

También se requiere formalizar release 0.2.0 con tag/release real en GitHub.

## What Changes

1. Activar funcionalidad real de filtros en sidebar de vault picker.
2. Añadir estado persistente de favoritos/shared/tags por vault.
3. Reemplazar iconografía emoji por paquete de iconos SaaS (`lucide-react`).
4. Extender creación/edición de entradas por tipo con campos dinámicos.
5. Actualizar documentación de funcionalidades y pruebas.

## Capabilities

### New Capabilities
- `vault-sidebar-filters`: Sidebar de vaults funcional y persistente.
- `multi-entry-types`: Entradas tipadas con formularios contextuales.

### Modified Capabilities
- `icon-system-refresh`: UI modernizada con librería de iconos coherente.
- `documentation-release-visibility`: README actualizado con feature set real.

## Impact

- `src/components/vault/VaultPicker.tsx`
- `src/components/vault/vaultPickerUtils.ts`
- `src/components/layout/Sidebar.tsx`
- `src/components/entry/EntryForm.tsx`
- `src/components/entry/entryTypes.ts`
- `tests/security.test.ts`
- `README.md`
- `package.json`
