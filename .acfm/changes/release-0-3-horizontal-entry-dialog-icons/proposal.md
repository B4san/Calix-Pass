## Why

El modal de `New Entry` se recorta verticalmente al seleccionar tipos con muchos
campos (SSH/Card), impidiendo completar datos. Además se requiere actualizar el
icono global de la app y Windows usando `fav/Icon.png`, y publicar release real
`0.3.0`.

## What Changes

1. Rediseñar modal de entrada a layout horizontal (2 columnas) y scroll interno
   robusto para evitar recortes.
2. Ampliar capacidad del componente `Dialog` para tamaños grandes.
3. Actualizar icono de app (window + installer + favicon) usando `fav/Icon.png`.
4. Ejecutar pruebas/build y publicar tag release `v0.3.0`.

## Capabilities

### Modified Capabilities
- `multi-entry-types`: formulario usable con tipos complejos sin clipping.
- `desktop-build`: iconografía de app actualizada en runtime y empaquetado.
