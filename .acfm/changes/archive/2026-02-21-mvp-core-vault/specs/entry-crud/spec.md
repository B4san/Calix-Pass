## ADDED: Entry CRUD Operations

### Requirements

- R1: The system MUST allow users to create new password entries within a group
- R2: The system MUST support entry fields: Title, UserName, Password, URL, Notes, Tags, Icon (built-in ID), Created, Modified
- R3: The system MUST generate a UUID for each new entry using crypto.getRandomValues()
- R4: The system MUST mark Password field as Protected (encrypted with inner random stream) by default
- R5: The system MUST allow users to edit any entry field
- R6: The system MUST record entry history on each modification (previous state saved with timestamp)
- R7: The system MUST allow users to delete entries (moved to Recycle Bin if enabled)
- R7: The system MUST allow users to permanently delete entries from Recycle Bin
- R8: The system MUST update the LastModificationTime on any entry change
- R9: The system MUST mark the vault as dirty (unsaved changes) on any entry modification
- R10: The system MUST allow users to view and restore previous entry versions from history

### Scenarios

- S1: WHEN a user creates a new entry in a group THEN the entry appears in the entry list with a generated UUID
- S2: WHEN a user edits an entry's password THEN the previous entry state is saved to history AND the vault dirty flag is set
- S3: WHEN a user deletes an entry THEN it moves to the Recycle Bin group (not permanently deleted)
- S4: WHEN a user permanently deletes from Recycle Bin THEN the entry is removed from the database entirely
- S5: WHEN a user views entry history THEN previous versions are listed with timestamps AND a Restore button is available
- S6: WHEN a user restores a previous version THEN the current state is saved to history AND the previous state becomes current
- S7: WHEN a new entry is created THEN the Password field is marked as Protected
- S8: WHEN a user adds tags to an entry THEN tags are stored as a semicolon-separated string AND searchable
