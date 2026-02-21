# KDBX 4.x Format Research

> Source: keepass.info/help/kb/kdbx4.html and kdbx4.1.html (fetched during Phase 2)

## KDBX 4.0 File Structure

### Outer Header
```
[4 bytes] Signature1: 0x9AA2D903
[4 bytes] Signature2: 0xB54BFB67
[2 bytes] Version Minor
[2 bytes] Version Major (4)

Repeating header fields:
[1 byte]  Field ID
[4 bytes] Field Length (uint32, NOT 2 bytes like KDBX 3.1)
[N bytes] Field Data

Field IDs:
  0x00 - EndOfHeader
  0x01 - Comment
  0x02 - CipherID (AES-256: 31c1f2e6bf714350be5805216afc5aff)
                   (ChaCha20: d6038a2b8b6f4cb5a524339a31dbb59a)
  0x03 - CompressionFlags (0=none, 1=gzip)
  0x04 - MasterSeed (32 bytes)
  0x07 - EncryptionIV (16 bytes AES, 12 bytes ChaCha20)
  0x0B - KdfParameters (VariantDictionary)
  0x0C - PublicCustomData (VariantDictionary, optional)
```

### VariantDictionary Format
```
[2 bytes] Version (0x0100)
Repeating items:
  [1 byte]  Value type
    0x04 = UInt32
    0x05 = UInt64
    0x08 = Bool
    0x0C = Int32
    0x0D = Int64
    0x18 = String (UTF-8)
    0x42 = ByteArray
  [4 bytes] Key name length
  [N bytes] Key name (UTF-8)
  [4 bytes] Value length
  [N bytes] Value data
Terminator: [1 byte] 0x00
```

### KDF Parameters (Argon2)
```
$UUID = Argon2d: ef636ddf8c29444b91f7a9a403e30a0c
        Argon2id: 9e298b1956db4773b23dfc3ec6f0a1e6

Keys in VariantDictionary:
  S  (ByteArray) - Salt (32 bytes)
  P  (UInt32)    - Parallelism
  M  (UInt64)    - Memory in bytes
  I  (UInt64)    - Iterations
  V  (UInt32)    - Version (0x13 = 1.3)
```

### KDF Parameters (AES-KDF, legacy)
```
$UUID = c9d9f39a628a4460bf740d08c18a4fea

Keys:
  S (ByteArray) - Seed (32 bytes)
  R (UInt64)    - Rounds
```

### Key Derivation
```
1. Composite key = SHA-256(SHA-256(password) || ...)
2. Derived key = KDF(composite_key, kdf_params) → 32 bytes
3. Final key for encryption:
   aesKey = SHA-256(masterSeed || derivedKey)
4. HMAC key:
   hmacBaseKey = SHA-512(masterSeed || derivedKey || 0x01)
```

### Header Integrity
```
headerHash = SHA-256(serialized_header_bytes)
hmacHeaderKey = SHA-512(0xFFFFFFFFFFFFFFFF || hmacBaseKey)
headerHMAC = HMAC-SHA-256(hmacHeaderKey, serialized_header_bytes)

Both are stored after the header, before the HMAC block stream.
```

### HMAC Block Stream (Encrypted Data)
```
Repeating blocks:
  [32 bytes] Block HMAC
  [4 bytes]  Block size (uint32)
  [N bytes]  Block data (encrypted)

Block key derivation:
  Ki = SHA-512(i_as_uint64_le || hmacBaseKey)
  where i is the 0-based block index

HMAC input for block i:
  HMAC-SHA-256(Ki, i_as_uint64_le || blockSize_as_int32_le || blockData)

Final block: size = 0, no data, HMAC of empty block
```

### Inner Header (after decryption + decompression)
```
Repeating fields:
  [1 byte]  Field ID
  [4 bytes] Field Length
  [N bytes] Field Data

Field IDs:
  0x00 - EndOfHeader
  0x01 - InnerRandomStreamID
         (0x02 = Salsa20, 0x03 = ChaCha20)
  0x02 - InnerRandomStreamKey (key for field protection)
  0x03 - Binary (attachment data, first byte = flags: 0x01 = protected)
```

### XML Database Content
- Follows inner header
- UTF-8 encoded XML
- Protected field values are Base64-encoded XOR with random stream
- Random stream initialized with InnerRandomStreamKey:
  - ChaCha20: key = SHA-512(innerKey)[0:32], nonce = SHA-512(innerKey)[32:44]
  - Salsa20: key = SHA-256(innerKey), nonce = 0xE830094B97205D2A

### Time Format (KDBX 4.x)
- Base64-encoded little-endian Int64
- Represents seconds since 0001-01-01 00:00:00 UTC
- Example: "2024-01-15 10:30:00 UTC" encoded as seconds from epoch

## KDBX 4.1 Additions
- Group Tags field (string)
- Optional password quality estimation flag
- Previous parent group tracking (PreviousParentGroup UUID)
- Custom icon metadata: Name (string), LastModificationTime

## Cipher Details
| Cipher | Key Size | IV Size | Mode |
|--------|----------|---------|------|
| AES-256 | 32 bytes | 16 bytes | CBC with PKCS7 padding |
| ChaCha20 | 32 bytes | 12 bytes | Stream cipher |

## Important Implementation Notes
1. Header field lengths are 4 bytes (uint32), NOT 2 bytes as in KDBX 3.1
2. All multi-byte integers are little-endian
3. HMAC verification MUST happen before decryption (Encrypt-then-MAC)
4. Block HMAC includes block index to prevent reordering attacks
5. Inner random stream state is continuous across all protected fields in document order
6. Empty final HMAC block signals end of data
7. Compression (gzip) is applied AFTER serialization, BEFORE encryption
