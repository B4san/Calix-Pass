## ADDED: File Locking (Multi-Tab Protection)

### Requirements

- R1: The system MUST acquire an exclusive lock on the vault file in OPFS when opening a vault
- R2: The system MUST release the lock when the vault is closed or the tab is closed
- R3: The system MUST prevent another tab from opening the same vault while locked
- R4: The system MUST display "This vault is open in another tab" error when lock acquisition fails
- R5: The system MUST use OPFS FileSystemSyncAccessHandle.close() or BroadcastChannel for lock coordination
- R6: The system MUST handle stale locks from crashed tabs gracefully (lock timeout or force-release option)

### Scenarios

- S1: WHEN Tab A opens a vault THEN Tab B cannot open the same vault AND sees "open in another tab" error
- S2: WHEN Tab A closes the vault THEN Tab B can open the vault
- S3: WHEN Tab A crashes (lock not released) THEN the system offers to force-release the stale lock
- S4: WHEN the user closes the browser tab THEN the lock is released on unload
- S5: WHEN the same vault exists in OPFS and as an imported file THEN they are treated as separate vaults with separate locks
