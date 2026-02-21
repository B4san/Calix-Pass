# Spec: Security Test Coverage

## functional_requirements

### ADDED Automated Security Unit Tests
Debe existir suite automatizada para validar:
- reglas de fortaleza de contraseña;
- generación de vault IDs válidos (UUID v4).

## acceptance_criteria

### ADDED Test Execution
- **GIVEN** pipeline local
- **WHEN** se ejecuta `npm run test:smoke`
- **THEN** tests pasan en verde.
