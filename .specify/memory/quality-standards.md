# Calix Pass - Code Quality Standards

**Version**: 1.0.0
**Date**: 2026-02-19
**Derived from**: `code-maintainability` + `vercel-react-best-practices` skills

---

## TypeScript Standards

### Strict Mode Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "verbatimModuleSyntax": true
  }
}
```

### Type Rules
- `any` is banned; each use requires justification comment
- All public functions have explicit return types
- Binary data uses branded types: `type EncryptedBuffer = Uint8Array & { __brand: 'encrypted' }`
- Prefer `unknown` over `any` for untrusted data
- Use discriminated unions for state machines

---

## Naming Conventions

| Construct | Convention | Example |
|-----------|-----------|---------|
| Files (components) | PascalCase | `EntryList.tsx` |
| Files (utilities) | camelCase | `cryptoUtils.ts` |
| Files (types) | camelCase | `types.ts` |
| Variables | camelCase | `entryCount` |
| Constants | SCREAMING_SNAKE | `MAX_KEY_SIZE` |
| Functions | camelCase verb | `decryptDatabase()` |
| Classes | PascalCase | `KdbxParser` |
| Interfaces | PascalCase (no I prefix) | `VaultEntry` |
| Type aliases | PascalCase | `EncryptionAlgorithm` |
| Booleans | is/has/can/should prefix | `isLocked`, `hasKeyFile` |
| React components | PascalCase | `PasswordGenerator` |
| React hooks | use prefix | `useVaultStore` |
| Zustand stores | use prefix + Store | `useVaultStore` |
| Test files | *.test.ts(x) | `kdbxParser.test.ts` |

---

## Architecture Rules

### Package Boundaries
```
@calix-pass/core     -> Zero browser/Node dependencies
@calix-pass/web      -> Imports from core only
@calix-pass/electron -> Imports from core and web
```

### Layer Separation
- **Core**: Pure functions, no side effects, no DOM, no framework
- **Web/UI**: React components, hooks, stores -- no crypto logic
- **Workers**: Bridge between UI and core crypto operations

### Dependency Rules
- UI components MUST NOT import from crypto modules directly
- Crypto operations MUST run through Web Worker messages
- Zustand stores MUST NOT contain async crypto operations
- File I/O (OPFS) MUST be abstracted behind interfaces

---

## React Best Practices (from Vercel guidelines)

### Critical Priority
- Parallel async operations: Use `Promise.all()` for independent fetches
- Direct imports: No barrel files (`index.ts` re-exports)
- Defer heavy components: Dynamic imports for modals/dialogs
- Move crypto to Web Workers: Never block the main thread

### High Priority
- Minimize serialization in props (pass IDs, not full objects)
- Parallel data fetching with Suspense boundaries

### Medium Priority
- Memoize expensive computations with `useMemo`
- Use `useCallback` for stable function references passed as props
- Derive state during render, not in effects
- Use `startTransition` for non-urgent updates (search filtering)
- Use refs for transient values (timers, previous values)

### Code Patterns
- Use ternary `condition ? <A /> : <B />` not `condition && <A />`
- Hoist static JSX outside components
- Build `Map`/`Set` for repeated lookups instead of `.find()`
- Cache regex creation outside loops/renders
- Early return from functions

---

## Error Handling Standards

### Error Hierarchy
```typescript
class CalixError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'CalixError';
  }
}

class CryptoError extends CalixError {}      // Encryption/decryption failures
class KdbxParseError extends CalixError {}   // Format parsing errors
class KdbxIntegrityError extends CalixError {} // HMAC/hash verification failures
class StorageError extends CalixError {}     // OPFS/file system errors
class ValidationError extends CalixError {}  // Input validation errors
```

### Rules
- Catch specific error types, never bare `catch (e)`
- Crypto errors MUST NOT expose key material in message
- All async operations MUST have error boundaries
- User-facing errors MUST be actionable ("File may be corrupted.
  Try opening with KeePass to verify integrity.")
- Log errors with context but without sensitive data

---

## Testing Standards

### Coverage Requirements
- `@calix-pass/core`: >= 90% line coverage
- `@calix-pass/web`: >= 70% line coverage
- Crypto functions: 100% branch coverage with test vectors

### Test Organization
```
packages/core/src/crypto/__tests__/aes.test.ts
packages/core/src/kdbx/__tests__/parser.test.ts
packages/web/src/components/__tests__/EntryList.test.tsx
```

### Test Naming
```typescript
describe('AES256CBC', () => {
  describe('encrypt', () => {
    it('should produce correct ciphertext for NIST test vector', () => {});
    it('should generate unique IV for each call', () => {});
    it('should reject key shorter than 256 bits', () => {});
    it('should zero key buffer after encryption', () => {});
  });
});
```

---

## Documentation Standards

- Public functions: JSDoc with `@param`, `@returns`, `@throws`
- Business logic: Comment explaining "why", not "what"
- Crypto code: Reference RFC/NIST standard in comments
- Complex algorithms: Link to KeePass source or spec section
- No TODO without issue reference
- No commented-out code in main branch

---

## File Size Limits

| File Type | Max Lines | Action if Exceeded |
|-----------|-----------|-------------------|
| Component | 200 | Extract sub-components |
| Utility module | 300 | Split by concern |
| Test file | 500 | Group into describe blocks |
| Store | 150 | Split into slices |
| Type definitions | 200 | Split by domain |
