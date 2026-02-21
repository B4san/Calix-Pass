# Spec: Desktop Build (Electron)

## functional_requirements

### ADDED Build Integrity
The Electron application MUST build successfully from source without syntax errors.

## technical_constraints

### ADDED Main Process
The `src/main/index.ts` file MUST be corrected to remove syntax errors preventing transpilation.

## acceptance_criteria

### ADDED Verify Build
- **GIVEN**: A clean codebase state
- **WHEN**: `npm run build` is executed
- **THEN**: The process exits with code 0
- **AND**: The application package is generated in `dist/` or `out/`.
