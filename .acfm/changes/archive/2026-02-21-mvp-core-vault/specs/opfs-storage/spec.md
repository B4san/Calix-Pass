## ADDED: OPFS Storage

### Requirements

- R1: The system MUST store vault files in Origin Private File System (OPFS)
- R2: The system MUST maintain a vaults.json metadata index with: vault name, UUID, last opened timestamp, file size
- R3: The system MUST store each vault as a .kdbx file named by its UUID
- R4: The system MUST use OPFS FileSystemSyncAccessHandle for synchronous read/write operations (in Web Worker)
- R5: The system MUST warn users when a vault file exceeds 100MB
- R6: The system MUST gracefully handle OPFS quota exceeded errors
- R7: The system MUST provide a fallback to in-memory-only mode if OPFS is unavailable (with export prompt)
- R8: The system MUST list available vaults from the metadata index for the vault picker UI

### Scenarios

- S1: WHEN a vault is saved THEN it is persisted to OPFS AND the vaults.json index is updated
- S2: WHEN the vault picker loads THEN available vaults are listed from vaults.json
- S3: WHEN a vault is deleted from OPFS THEN it is removed from vaults.json
- S4: WHEN a vault exceeds 100MB THEN a warning is displayed to the user
- S5: WHEN OPFS quota is exceeded THEN an error message explains the situation
- S6: WHEN OPFS is not available THEN the app operates in-memory-only with an export prompt on close
