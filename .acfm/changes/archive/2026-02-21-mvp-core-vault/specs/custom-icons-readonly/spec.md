## ADDED: Custom Icons (Read-Only)

### Requirements

- R1: The system MUST parse custom icons from the KDBX inner header (stored as binary attachments with icon flag)
- R2: The system MUST display custom icons for entries and groups that reference them
- R3: The system MUST preserve custom icons during round-trip (open, modify, save)
- R4: The system MUST provide a built-in icon picker with the 69 standard KeePass icons for new entries/groups
- R5: The system MUST NOT support uploading new custom icons in MVP (deferred)
- R6: The system MUST store icon data as PNG in the domain model (convert from other formats if needed)

### Scenarios

- S1: WHEN a KDBX file with custom icons is opened THEN entries display their custom icons
- S2: WHEN a user creates a new entry THEN the icon picker shows 69 built-in icons
- S3: WHEN a user selects a built-in icon THEN the entry displays that icon
- S4: WHEN a vault with custom icons is saved THEN the custom icons are preserved in the output file
- S5: WHEN a KDBX file with custom icons is round-tripped through Calix Pass THEN icons remain intact when opened in KeePassXC
