## ADDED: Group CRUD Operations

### Requirements

- R1: The system MUST allow users to create new groups within the group tree
- R2: The system MUST generate a UUID for each new group using crypto.getRandomValues()
- R3: The system MUST support group properties: Name, Icon (built-in ID), Created, Modified, IsExpanded
- R4: The system MUST support nested groups to arbitrary depth (no artificial limit)
- R5: The system MUST allow users to rename groups
- R6: The system MUST allow users to delete groups (moved to Recycle Bin if enabled; child groups and entries moved with it)
- R7: The system MUST allow permanent deletion of groups from Recycle Bin (cascade deletes all children)
- R8: The system MUST update LastModificationTime on any group change
- R9: The system MUST mark the vault as dirty on any group modification
- R10: The system MUST persist group expansion state (IsExpanded) for UI rendering

### Scenarios

- S1: WHEN a user creates a new group THEN it appears as a child of the selected group with a generated UUID
- S2: WHEN a user creates a nested group (group within group) THEN the hierarchy is correctly maintained
- S3: WHEN a user renames a group THEN the new name is reflected in the tree AND the vault is marked dirty
- S4: WHEN a user deletes a group with children THEN the entire subtree moves to Recycle Bin
- S5: WHEN a user permanently deletes a group from Recycle Bin THEN all child groups and entries are permanently removed
- S6: WHEN a user collapses/expands a group in the UI THEN the IsExpanded state is persisted
- S7: WHEN the vault is saved and reopened THEN group expansion states are restored
