## ADDED: Vault Opening

### Requirements

- R1: The system MUST allow users to open .kdbx files from the local filesystem via the File API
- R2: The system MUST allow users to open vaults previously stored in OPFS
- R3: The system MUST prompt for the master password before attempting decryption
- R4: The system MUST derive the encryption key from the master password using the KDF parameters stored in the file header
- R5: The system MUST verify header integrity (SHA-256 hash + HMAC) before proceeding to block decryption
- R6: The system MUST verify all HMAC blocks before decryption (Encrypt-then-MAC)
- R7: The system MUST decrypt, decompress, and parse the database XML
- R8: The system MUST copy imported .kdbx files into OPFS for persistence
- R9: The system MUST display a generic error "Could not open vault. Check your password and try again." on decryption failure
- R10: The system MUST populate the Zustand vault store with the parsed database model
- R11: The system MUST zero the master password buffer after key derivation

### Scenarios

- S1: WHEN a user selects a .kdbx file and enters the correct password THEN the vault opens AND entries are displayed
- S2: WHEN a user enters an incorrect password THEN a generic error message is shown AND no data is exposed
- S3: WHEN a user opens a vault from OPFS THEN it loads without requiring file re-import
- S4: WHEN a .kdbx file is imported THEN it is copied to OPFS AND appears in future vault picker listings
- S5: WHEN a KDBX 4.0 file from KeePassXC is opened THEN all entries, groups, and metadata are correctly loaded
- S6: WHEN a KDBX 4.1 file is opened THEN 4.1-specific fields are preserved
- S7: WHEN the file is corrupted (invalid signature or header hash) THEN a descriptive error is shown
- S8: WHEN decryption completes THEN the master password buffer is zeroed
