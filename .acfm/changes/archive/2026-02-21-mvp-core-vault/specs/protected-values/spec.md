## ADDED: Protected Values (In-Memory Encryption)

### Requirements

- R1: The system MUST store the Password field as a ProtectedValue (XOR-masked in memory), not as a plain string
- R2: The system MUST implement ProtectedValue with: xorMask (Uint8Array), plainText getter (decrypts on access), zero() method
- R3: The system MUST derive the XOR mask from a session-specific random key generated on vault unlock
- R4: The system MUST re-XOR all ProtectedValues with a fresh mask when the vault locks (defense in depth)
- R5: The system MUST zero the XOR mask and any decrypted buffers immediately after use
- R6: The system MUST NOT expose protected values in React DevTools, console logs, or error messages
- R7: The system MUST serialize ProtectedValue to/from KDBX inner random stream format on save/load

### Scenarios

- S1: WHEN a password is stored in memory THEN inspecting the JavaScript heap does not reveal the plaintext
- S2: WHEN the ProtectedValue.plainText getter is called THEN the plaintext is returned AND the temporary buffer is zeroed after
- S3: WHEN a vault is locked THEN all ProtectedValue masks are regenerated AND previous plaintexts cannot be recovered
- S4: WHEN a password is copied to clipboard THEN the plainText is obtained, copied, then zeroed
- S5: WHEN a vault is saved THEN ProtectedValues are serialized via the inner random stream
- S6: WHEN a vault is loaded THEN protected fields become ProtectedValue instances
