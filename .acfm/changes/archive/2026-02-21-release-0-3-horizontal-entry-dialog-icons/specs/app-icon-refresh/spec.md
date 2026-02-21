# Spec: App Icon Refresh

## functional_requirements

### ADDED Unified App Icon
La app MUST usar `fav/Icon.png` como fuente para:
- icono de ventana Electron;
- recursos de build Windows;
- favicon del renderer.

## acceptance_criteria

### ADDED Icon Presence
- **GIVEN** build local
- **WHEN** app inicia y renderer carga
- **THEN** iconos apuntan al nuevo recurso unificado.
