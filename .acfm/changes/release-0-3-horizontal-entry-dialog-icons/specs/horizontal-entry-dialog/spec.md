# Spec: Horizontal Entry Dialog

## functional_requirements

### ADDED Horizontal Layout
El formulario de nueva entrada MUST usar distribución horizontal (2 columnas en desktop)
para mejorar visibilidad de campos.

### ADDED Scroll Safety
El diálogo MUST soportar overflow interno para evitar recorte de campos en viewport bajo.

## acceptance_criteria

### ADDED No Clipping
- **GIVEN** tipo SSH o Card con campos extensos
- **WHEN** se abre New Entry
- **THEN** todos los campos son alcanzables por scroll interno sin clipping.
