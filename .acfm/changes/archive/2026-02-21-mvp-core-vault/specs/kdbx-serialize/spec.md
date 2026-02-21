## ADDED: KDBX 4.x Serializer

### Requirements

- R1: The system MUST serialize a database to KDBX 4.0 binary format by default
- R2: The system MUST write the correct file signature bytes and version (major=4, minor=0)
- R3: The system MUST serialize the outer header with all required fields: CipherID (AES-256), CompressionFlags (gzip), MasterSeed (32 random bytes), EncryptionIV (16 random bytes), KdfParameters
- R4: The system MUST serialize KdfParameters as a VariantDictionary
- R5: The system MUST compute and write the header SHA-256 hash after the outer header
- R6: The system MUST compute and write the header HMAC-SHA-256 after the header hash
- R7: The system MUST serialize the inner header with InnerRandomStreamID (ChaCha20), InnerRandomStreamKey (64 random bytes), and binary attachments
- R8: The system MUST serialize the XML database content with protected field values encoded via the inner random stream
- R9: The system MUST compress the serialized data with gzip before encryption
- R10: The system MUST encrypt the compressed data with AES-256-CBC using the derived key
- R11: The system MUST split the encrypted data into HMAC blocks with per-block HMAC-SHA-256
- R12: The system MUST write a final empty HMAC block (size=0) as stream terminator
- R13: The system MUST generate a fresh MasterSeed and EncryptionIV on every save (no nonce reuse)
- R14: The system MUST preserve unknown XML elements from the original file during round-trip
- R15: The system MUST encode times as Base64 Int64 (seconds since 0001-01-01 UTC)

### Scenarios

- S1: WHEN saving a newly created database THEN the output is a valid KDBX 4.0 file that KeePassXC can open
- S2: WHEN opening a KeePassXC file, modifying an entry, and saving THEN KeePassXC can open the result AND all unmodified data is preserved
- S3: WHEN saving THEN MasterSeed and EncryptionIV are freshly generated (different from previous save)
- S4: WHEN saving THEN the header hash and HMAC are correct for the serialized header bytes
- S5: WHEN saving THEN each HMAC block can be independently verified
- S6: WHEN saving a database with binary attachments THEN the attachments are correctly written to the inner header
- S7: WHEN saving THEN times are encoded as Base64 Int64 AND can be correctly decoded on re-read
- S8: WHEN round-tripping (parse → serialize → parse) a complex file THEN all entries, groups, history, and metadata match the original
