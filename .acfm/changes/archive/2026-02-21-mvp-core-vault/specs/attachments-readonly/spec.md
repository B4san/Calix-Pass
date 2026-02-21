## ADDED: Binary Attachments (Read-Only)

### Requirements

- R1: The system MUST parse binary attachments from the KDBX inner header
- R2: The system MUST display the list of attachments for each entry (filename, size)
- R3: The system MUST allow users to download attachments to their local filesystem
- R4: The system MUST preserve attachments during round-trip (open, modify, save)
- R5: The system MUST NOT support uploading new attachments in MVP (deferred)
- R6: The system MUST NOT display attachments that exceed 50MB in size (show "Large attachment" placeholder)
- R7: The system MUST store attachment data in the domain model with metadata (filename, size, protection flag)

### Scenarios

- S1: WHEN an entry has attachments THEN they are listed in the entry detail view
- S2: WHEN a user clicks download on an attachment THEN the file is downloaded to their computer
- S3: WHEN a vault with attachments is saved THEN attachments are preserved in the output file
- S4: WHEN an attachment exceeds 50MB THEN a placeholder message is shown instead of loading into memory
- S5: WHEN a KDBX file with attachments is round-tripped THEN attachments remain intact when opened in KeePassXC
