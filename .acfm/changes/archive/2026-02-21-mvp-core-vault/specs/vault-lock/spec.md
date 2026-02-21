## ADDED: Vault Locking

### Requirements

- R1: The system MUST lock the vault after a configurable inactivity timeout (default 300 seconds / 5 minutes)
- R2: The system MUST allow users to manually lock the vault via a Lock button
- R3: The system MUST clear ALL sensitive data from Zustand stores on lock: decrypted XML, entries, groups, master key, derived keys
- R4: The system MUST zero all sensitive ArrayBuffers on lock
- R5: The system MUST display the unlock screen (password prompt) when the vault is locked
- R6: The system MUST re-derive the full key from the master password on unlock (not cache the key)
- R7: The system MUST reset the inactivity timer on user interaction (mouse move, key press, click)
- R8: The system MUST lock the vault when the browser tab becomes hidden (visibilitychange event) for more than the timeout period

### Scenarios

- S1: WHEN the user is inactive for 5 minutes (default) THEN the vault locks automatically
- S2: WHEN the user clicks the Lock button THEN the vault locks immediately
- S3: WHEN the vault locks THEN all decrypted data is cleared from memory AND the unlock screen is shown
- S4: WHEN the user enters the correct password on the unlock screen THEN the vault is decrypted and reopened
- S5: WHEN the user moves the mouse or types THEN the inactivity timer resets
- S6: WHEN the user changes the timeout setting to 60 seconds THEN the vault locks after 60 seconds of inactivity
- S7: WHEN the browser tab is hidden and the timeout elapses THEN the vault locks
- S8: WHEN the vault is locked and unlocked THEN the key is derived fresh from the password (not cached)
