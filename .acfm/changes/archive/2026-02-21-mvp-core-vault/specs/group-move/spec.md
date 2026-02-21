## ADDED: Group/Entry Move Operations

### Requirements

- R1: The system MUST allow users to move entries between groups via context menu "Move to..."
- R2: The system MUST allow users to move groups to a different parent via context menu "Move to..."
- R3: The system MUST prevent moving a group into itself or any of its descendants (cycle prevention)
- R4: The system MUST prevent moving the Root group
- R5: The system MUST prevent moving the Recycle Bin group
- R6: The system MUST show a group picker modal for selecting the target group
- R7: The system MUST update the parent group reference on the moved item
- R8: The system MUST update LastModificationTime on the moved item and both source/target groups
- R9: The system MUST mark the vault as dirty on any move operation

### Scenarios

- S1: WHEN a user right-clicks an entry and selects "Move to..." THEN a group picker modal appears
- S2: WHEN a user selects a target group in the picker THEN the entry is moved to that group
- S3: WHEN a user moves a group to a new parent THEN it appears under the new parent in the tree
- S4: WHEN a user attempts to move a group into itself THEN the operation is blocked with an error message
- S5: WHEN a user attempts to move a group into one of its descendants THEN the operation is blocked
- S6: WHEN a user attempts to move the Root group THEN the option is disabled
- S7: WHEN a move completes THEN the vault is marked dirty
