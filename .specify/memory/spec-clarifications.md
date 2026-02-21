# Specification Clarifications

> Generated during Phase 3 spec-clarification step.
> These decisions are FINAL and must be respected during implementation.

## Clarifications

- Q: Which fields should be marked Protected (inner random stream) by default when writing new entries? → A: **Password only**. Matches KeePassXC default. Notes remain searchable.

- Q: How should vault file locking work across browser tabs? → A: **Exclusive lock**. Second tab gets "Vault is open in another tab" error. No concurrent writes.

- Q: Should the Recycle Bin group be enabled by default? → A: **Yes, enabled by default**. Matches KeePass/KeePassXC behavior. Prevents accidental data loss.

- Q: How to handle custom entry/group icons in MVP? → A: **Read-only custom icons**. Display custom icons from imported .kdbx files. Provide built-in icon picker for new entries. Defer custom icon upload.

- Q: How to handle binary attachments in KDBX entries? → A: **Read-only attachments**. Preserve during round-trip. Display attachment list with download button. Defer upload capability.

## Sections Impacted

| Clarification | Impacted Areas |
|---------------|----------------|
| Protected fields | KDBX serializer, inner stream cipher, entry model |
| File locking | OPFS adapter, vault store, error handling |
| Recycle Bin | Group model, deletion logic, KDBX metadata, UI |
| Custom icons | Icon storage, entry/group display, icon picker component |
| Attachments | Inner header parser, entry model, detail view UI |

## Coverage Summary

| Area | Status |
|------|--------|
| Cryptographic implementation | Clear |
| KDBX format handling | Resolved (5 clarifications) |
| UI/UX flow | Clear (brainstorming decisions) |
| Storage strategy | Clear |
| Error handling | Clear |
| Testing strategy | Clear |
| Outstanding ambiguities | None blocking |
