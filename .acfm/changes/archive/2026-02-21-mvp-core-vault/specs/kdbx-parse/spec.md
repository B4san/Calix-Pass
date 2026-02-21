## ADDED: KDBX 4.x Parser

### Requirements

- R1: The system MUST parse KDBX 4.0 and 4.1 file format binary data
- R2: The system MUST validate the file signature bytes (0x9AA2D903, 0xB54BFB67) and version (major=4)
- R3: The system MUST parse the outer header fields: CipherID, CompressionFlags, MasterSeed, EncryptionIV, KdfParameters, PublicCustomData
- R4: The system MUST parse KdfParameters as a VariantDictionary with type codes (UInt32=0x04, UInt64=0x05, Bool=0x08, Int32=0x0C, Int64=0x0D, String=0x18, ByteArray=0x42)
- R5: The system MUST verify the header SHA-256 hash stored after the outer header
- R6: The system MUST verify the header HMAC-SHA-256 stored after the header hash
- R7: The system MUST read and verify the HMAC block stream (block-by-block HMAC verification before decryption)
- R8: The system MUST decrypt the reassembled block data using the cipher specified in the header (AES-256-CBC or ChaCha20)
- R9: The system MUST decompress the decrypted data if CompressionFlags indicates gzip
- R10: The system MUST parse the inner header fields: InnerRandomStreamID, InnerRandomStreamKey, Binary attachments
- R11: The system MUST parse the UTF-8 XML database content following the inner header
- R12: The system MUST decode protected field values using the inner random stream (ChaCha20 or Salsa20)
- R13: The system MUST decode KDBX 4.x time values from Base64-encoded Int64 (seconds since 0001-01-01 UTC)
- R14: The system MUST preserve unknown/unrecognized XML elements for round-trip fidelity
- R15: The system MUST read all header field lengths as 4-byte uint32 (not 2-byte as in KDBX 3.1)
- R16: The system MUST use little-endian byte order for all multi-byte integers

### Scenarios

- S1: WHEN opening a valid KDBX 4.0 file created by KeePassXC with correct password THEN all entries and groups are parsed correctly
- S2: WHEN opening a valid KDBX 4.1 file THEN 4.1-specific fields (group tags, previous parent group) are preserved
- S3: WHEN the file signature bytes are invalid THEN a FormatError is thrown immediately
- S4: WHEN the version major is not 4 THEN an UnsupportedVersionError is thrown
- S5: WHEN the header SHA-256 hash does not match THEN a CorruptionError is thrown
- S6: WHEN the header HMAC does not match (wrong password) THEN a generic "Could not open vault" error is thrown
- S7: WHEN an HMAC block verification fails THEN an IntegrityError is thrown before decryption
- S8: WHEN the file uses gzip compression THEN the data is correctly decompressed after decryption
- S9: WHEN the file uses no compression THEN the raw decrypted data is used as-is
- S10: WHEN binary attachments are present in the inner header THEN they are stored in the domain model with their protection flag
- S11: WHEN the file contains unknown XML elements THEN they are preserved in a pass-through structure
- S12: WHEN times are encoded as Base64 Int64 THEN they are correctly decoded to Date objects
