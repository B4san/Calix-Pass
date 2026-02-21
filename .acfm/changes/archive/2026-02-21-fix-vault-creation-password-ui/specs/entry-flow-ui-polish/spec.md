# Spec: Entry Flow UI Polish

## functional_requirements

### ADDED Password Visibility Toggle
Pantallas de crear/unlock vault MUST permitir mostrar/ocultar contraseña con icono de ojo.

### MODIFIED Reference-Based Visual Refresh
Pantallas de onboarding/picker/dialog MUST adoptar layout profesional inspirado en
la referencia de `UI/` (barra superior, tarjetas limpias, paneles claros, densidad equilibrada).

### MODIFIED CSP-Compatible Typography
UI MUST eliminar fuentes remotas bloqueadas por CSP y usar stack local compatible.

## acceptance_criteria

### ADDED Visibility Toggle Behavior
- **GIVEN** campo de contraseña
- **WHEN** usuario toca icono de ojo
- **THEN** alterna entre `password` y `text` sin perder valor.

### ADDED CSP Warning Removal
- **GIVEN** app en runtime con CSP actual
- **WHEN** carga inicial
- **THEN** no aparece warning por `fonts.googleapis.com`.
