## ADDED: Inner Random Stream (ChaCha20/Salsa20)

### Requirements

- R1: The system MUST support ChaCha20 inner random stream for protecting field values in KDBX 4.x
- R2: The system MUST support Salsa20 inner random stream for reading KDBX files created by older tools
- R3: The system MUST initialize ChaCha20 with: key = SHA-512(innerKey)[0:32], nonce = SHA-512(innerKey)[32:44]
- R4: The system MUST initialize Salsa20 with: key = SHA-256(innerKey), nonce = 0xE830094B97205D2A
- R5: The system MUST maintain continuous stream state across all protected fields in XML document order
- R6: The system MUST use ChaCha20 (stream ID 0x03) when writing new KDBX files
- R7: Protected field values are Base64-decoded, XORed with the stream, then stored as plaintext in the domain model
- R8: When serializing, plaintext values are XORed with the stream and Base64-encoded back into XML

### Scenarios

- S1: WHEN reading a KDBX file with ChaCha20 inner stream THEN protected field values are correctly decrypted
- S2: WHEN reading a KDBX file with Salsa20 inner stream THEN protected field values are correctly decrypted
- S3: WHEN multiple protected fields exist THEN the stream state is continuous (not reinitialized per field)
- S4: WHEN a protected field is decrypted and re-encrypted in the same position THEN the round-trip produces identical output
- S5: WHEN writing a new KDBX file THEN ChaCha20 (ID 0x03) is used for the inner stream
- S6: WHEN given known test vectors for ChaCha20 THEN the stream output matches expected bytes
