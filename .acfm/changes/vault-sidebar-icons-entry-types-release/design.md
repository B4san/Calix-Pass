## Context

Se requiere un cambio transversal en UX de vault picker y entry forms, incluyendo
estado persistente de filtros, modernización visual con paquete de iconos y
extensión del modelo de entrada sin romper compatibilidad KDBX.

## Design Decisions

1. `lucide-react` como librería iconográfica principal.
2. Persistencia de preferencias de vault picker en `localStorage` del renderer.
3. Filtros encapsulados en utilidades puras testeables (`vaultPickerUtils`).
4. Tipos de entrada declarativos en `entryTypes.ts` y serialización en `fields`
   con clave `EntryType`.
5. Mantener compatibilidad con entradas legacy inferiendo tipo por campos existentes.

## Test Strategy

- Tests unitarios de:
  - política de contraseña + UUID;
  - filtros de sidebar;
  - normalización de tags;
  - detección y construcción de campos por tipo de entrada.
- Validación técnica: `test:smoke`, `typecheck`, `build`.
