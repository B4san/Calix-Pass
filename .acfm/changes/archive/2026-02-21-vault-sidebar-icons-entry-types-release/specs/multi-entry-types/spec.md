# Spec: Multi Entry Types

## functional_requirements

### ADDED Entry Type Selection
El formulario de entradas MUST solicitar tipo de entrada antes de capturar datos.

### ADDED Dynamic Fields
Según tipo seleccionado, MUST mostrarse campos específicos:
- Password
- SSH Key
- Payment Card
- Secure Note
- Identity

## acceptance_criteria

### ADDED Dynamic Form Behavior
- **GIVEN** usuario cambia tipo de entrada
- **WHEN** formulario renderiza
- **THEN** los inputs visibles cambian al set de campos del tipo.

### ADDED Entry Type Persistence
- **GIVEN** entrada guardada
- **WHEN** se vuelve a editar
- **THEN** conserva tipo (`EntryType`) y campos asociados.
