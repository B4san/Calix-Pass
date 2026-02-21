## ADDED: Vault Saving

### Requirements

- R1: The system MUST save the current vault state to OPFS on explicit user action (Save button or Ctrl+S)
- R2: The system MUST NOT auto-save; the vault tracks a "dirty" flag for unsaved changes
- R3: The system MUST display an unsaved changes indicator (dot/badge) when the vault has been modified
- R4: The system MUST allow users to export the vault as a .kdbx file to the local filesystem via File API (Save As / Download)
- R5: The system MUST generate fresh MasterSeed and EncryptionIV on every save
- R6: The system MUST update the LastModificationTime in the database metadata
- R7: The system MUST update the vaults.json index in OPFS after saving
- R8: The system MUST warn the user if they attempt to close the tab/browser with unsaved changes (beforeunload)

### Scenarios

- S1: WHEN the user clicks Save THEN the vault is serialized to KDBX and written to OPFS
- S2: WHEN the user modifies an entry THEN the dirty indicator appears AND it disappears after save
- S3: WHEN the user clicks "Export" / "Save As" THEN a .kdbx file is downloaded via the browser
- S4: WHEN the user attempts to close the tab with unsaved changes THEN a browser confirmation dialog appears
- S5: WHEN the vault is saved THEN the OPFS vaults.json index reflects the new modification time
- S6: WHEN the vault is saved twice THEN each save uses a different MasterSeed and EncryptionIV
- S7: WHEN no changes have been made THEN the dirty indicator is not shown AND the save action is a no-op
