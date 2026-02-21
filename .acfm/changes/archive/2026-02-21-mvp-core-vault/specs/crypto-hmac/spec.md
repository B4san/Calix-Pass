## ADDED: HMAC-SHA-256 Block Stream Integrity

### Requirements

- R1: The system MUST verify HMAC-SHA-256 on each block of the KDBX HMAC block stream before decryption (Encrypt-then-MAC)
- R2: The system MUST derive per-block HMAC keys using Ki = SHA-512(i_as_uint64_le || hmacBaseKey) where i is the 0-based block index
- R3: The system MUST compute HMAC input as: i_as_uint64_le || blockSize_as_int32_le || blockData
- R4: The system MUST verify the header HMAC using key = SHA-512(0xFFFFFFFFFFFFFFFF || hmacBaseKey)
- R5: The system MUST reject any block where HMAC verification fails with an IntegrityError
- R6: The system MUST detect the final block (size = 0) and verify its HMAC
- R7: The system MUST generate valid HMAC block streams when serializing (writing) KDBX files
- R8: The system MUST compute hmacBaseKey as SHA-512(masterSeed || derivedKey || 0x01)

### Scenarios

- S1: WHEN reading a valid KDBX file THEN all block HMACs verify successfully AND decrypted content is returned
- S2: WHEN a single byte is modified in a block THEN HMAC verification fails for that block AND an IntegrityError is thrown
- S3: WHEN blocks are reordered THEN HMAC verification fails (block index is part of HMAC input)
- S4: WHEN the header is modified after signing THEN header HMAC verification fails
- S5: WHEN the final block (size=0) has an invalid HMAC THEN an IntegrityError is thrown
- S6: WHEN serializing a database THEN the generated HMAC block stream can be verified by re-reading
