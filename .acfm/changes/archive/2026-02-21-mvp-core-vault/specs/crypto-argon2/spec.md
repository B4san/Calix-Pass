## ADDED: Argon2id Key Derivation

### Requirements

- R1: The system MUST derive a 32-byte key from a master password using Argon2id via hash-wasm WASM module
- R2: The system MUST support configurable parameters: iterations (time cost), memory (in bytes), parallelism
- R3: The system MUST use default parameters matching KeePass: iterations=2, memory=67108864 (64MB), parallelism=2
- R4: The system MUST also support Argon2d variant for reading legacy KDBX files that use it
- R5: The system MUST accept a 32-byte salt parameter
- R6: The system MUST run Argon2 computation in a Web Worker to avoid blocking the main thread
- R7: The system MUST zero the password input buffer after deriving the key

### Scenarios

- S1: WHEN deriving a key with password "test" and known salt/params THEN the output matches the Argon2id reference vector
- S2: WHEN using default KeePass parameters (iter=2, mem=64MB, par=2) THEN derivation completes within 3 seconds on modern hardware
- S3: WHEN memory parameter exceeds available WebAssembly memory THEN the operation throws a ResourceError with a descriptive message
- S4: WHEN deriving with Argon2d variant THEN the output matches the Argon2d reference vector
- S5: WHEN derivation completes THEN the password input buffer is zeroed
- S6: WHEN called from the main thread THEN the operation delegates to a Web Worker AND the main thread remains responsive
