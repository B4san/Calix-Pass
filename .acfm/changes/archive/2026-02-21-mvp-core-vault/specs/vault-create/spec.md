## ADDED: Vault Creation

### Requirements

- R1: The system MUST allow users to create a new vault with a master password
- R2: The system MUST generate a new KDBX 4.0 database with default settings: AES-256-CBC cipher, gzip compression, Argon2id KDF (iter=2, mem=64MB, par=2)
- R3: The system MUST create a default "Root" group as the top-level group
- R4: The system MUST create and enable a "Recycle Bin" group by default
- R5: The system MUST generate the database UUID, root group UUID, and recycle bin UUID using crypto.getRandomValues()
- R6: The system MUST store the new vault in OPFS and update the vaults.json metadata index
- R7: The system MUST validate that the master password is not empty
- R8: The system MUST hash the master password immediately and zero the raw password buffer

### Scenarios

- S1: WHEN a user provides a valid master password THEN a new vault is created AND persisted to OPFS AND appears in the vault picker
- S2: WHEN a user provides an empty password THEN vault creation is rejected with a validation error
- S3: WHEN a new vault is created THEN it contains a Root group and Recycle Bin group
- S4: WHEN a new vault is created THEN it uses KDBX 4.0 defaults (AES-256-CBC, gzip, Argon2id)
- S5: WHEN the vault is saved to OPFS THEN the vaults.json index is updated with name, UUID, and creation date
- S6: WHEN the vault is created and exported as .kdbx THEN KeePassXC can open it with the same master password
