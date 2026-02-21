# Spec: Vault Sidebar Filters

## functional_requirements

### ADDED Functional Sidebar Actions
Los botones de sidebar de vaults MUST aplicar filtros reales:
- all
- recent (<= 7 días)
- favorites
- shared
- tagged

### ADDED Persistent Vault Preferences
El estado de favoritos/shared/tags MUST persistir localmente entre sesiones.

## acceptance_criteria

### ADDED Sidebar Filtering
- **GIVEN** varios vaults
- **WHEN** usuario selecciona cada filtro de sidebar
- **THEN** la lista visible se actualiza según el criterio.

### ADDED Persistence
- **GIVEN** usuario marca favorito/shared y define tags
- **WHEN** reinicia la app
- **THEN** preferencias se mantienen.
