## ADDED: AES-256-CBC Encryption

### Requirements

- R1: The system MUST encrypt plaintext data using AES-256-CBC with PKCS7 padding via Web Crypto API (`crypto.subtle`)
- R2: The system MUST generate a unique 16-byte random IV per encryption operation via `crypto.getRandomValues()`
- R3: The system MUST decrypt AES-256-CBC ciphertext and remove PKCS7 padding
- R4: The system MUST reject keys that are not exactly 32 bytes
- R5: The system MUST run all AES operations in a Web Worker, never on the main thread
- R6: The system MUST zero key material from memory (ArrayBuffer) immediately after use

### Scenarios

- S1: WHEN encrypting with a 32-byte key and plaintext THEN the output is valid AES-256-CBC ciphertext AND decrypting with the same key and IV recovers the original plaintext
- S2: WHEN encrypting the same plaintext twice THEN the ciphertexts differ AND the IVs differ (unique IV per operation)
- S3: WHEN decrypting with an incorrect key THEN the operation throws a CryptoError AND no partial plaintext is exposed
- S4: WHEN a key shorter or longer than 32 bytes is provided THEN the operation throws a ValidationError before any crypto operation
- S5: WHEN encryption completes THEN the key ArrayBuffer is zeroed (all bytes 0x00)
- S6: WHEN given NIST AES-256-CBC test vectors THEN encryption and decryption produce the expected outputs
