## ADDED: Clipboard Manager

### Requirements

- R1: The system MUST allow users to copy entry fields (UserName, Password, URL) to the clipboard
- R2: The system MUST auto-clear the clipboard after a configurable timeout (default 10 seconds)
- R3: The system MUST use navigator.clipboard.writeText() for clipboard operations
- R4: The system MUST clear by writing an empty string (not by reading/comparing)
- R5: The system MUST show a visual confirmation when content is copied
- R6: The system MUST track clipboard content type (which field was copied)
- R7: The system MUST NOT log clipboard contents to console or storage

### Scenarios

- S1: WHEN a user clicks the copy button on a Password field THEN the password is copied AND a "Copied" confirmation appears
- S2: WHEN content is copied THEN the clipboard is automatically cleared after 10 seconds
- S3: WHEN the user changes the timeout setting to 30 seconds THEN clipboard clears after 30 seconds
- S4: WHEN a user copies a URL THEN it can be pasted in another application
- S5: WHEN clipboard auto-clear happens THEN attempting to paste shows empty content
- S6: WHEN copy fails (browser permission denied) THEN an error message is shown
