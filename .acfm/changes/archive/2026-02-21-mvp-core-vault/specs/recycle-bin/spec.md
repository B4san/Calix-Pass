## ADDED: Recycle Bin

### Requirements

- R1: The system MUST enable a Recycle Bin group by default in new vaults
- R2: The system MUST designate one group as the Recycle Bin (tracked by UUID in database metadata)
- R3: The system MUST move deleted entries and groups to the Recycle Bin instead of permanent deletion
- R4: The system MUST preserve the original parent reference when moving to Recycle Bin (for KDBX 4.1 compatibility)
- R5: The system MUST allow users to restore items from the Recycle Bin to their original location
- R6: The system MUST allow users to permanently delete items from the Recycle Bin
- R7: The system MUST empty the Recycle Bin on user request (delete all contents)
- R8: The system MUST recognize the Recycle Bin from imported KDBX files and use it

### Scenarios

- S1: WHEN a user deletes an entry THEN it moves to the Recycle Bin group AND is not permanently deleted
- S2: WHEN a user deletes a group with children THEN the entire subtree moves to the Recycle Bin
- S3: WHEN a user restores an entry from Recycle Bin THEN it returns to its original group
- S4: WHEN a user permanently deletes from Recycle Bin THEN the entry is removed from the database
- S5: WHEN a user clicks "Empty Recycle Bin" THEN all items in the Recycle Bin are permanently deleted
- S6: WHEN a KDBX file is imported that has a Recycle Bin THEN it is recognized and used
- S7: WHEN a new vault is created THEN a Recycle Bin group is automatically created and enabled
