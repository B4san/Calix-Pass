# Brainstorming Decisions — Calix Pass MVP

> Generated during Phase 2 brainstorming. These decisions are FINAL for MVP scope.

## KDBX Format Implementation

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Read support | KDBX 4.0 + 4.1 | Maximize compatibility |
| Write format | KDBX 4.0 | Matches KeePassXC default, widest tool support |
| Unknown XML elements | Preserve on round-trip | Never lose user data silently |
| Inner random stream (read) | ChaCha20 + Salsa20 | Some 4.0 files use Salsa20 |
| Inner random stream (write) | ChaCha20 | KDBX 4.x default |
| kdbxweb dependency | Reference only, no dependency | Full control over security-critical code path |

## Cryptographic Implementation

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Argon2 WASM library | hash-wasm | Small bundle, maintained, supports Argon2id/d + SHA family |
| Default Argon2id params | iterations=2, memory=64MB, parallelism=2 | Match KeePass defaults for compatibility |
| CompositeKey type | Extensible with slots (password, keyFile, challenge-response) | MVP: password slot only |
| ProtectedValue (XOR-masked in-memory) | Yes, implement | Non-negotiable for production password manager |

## Web Storage & File Handling

| Decision | Choice | Rationale |
|----------|--------|-----------|
| OPFS structure | `vaults.json` index + `.kdbx` files | Fast vault picker without decryption |
| File size warning | 100MB threshold | OPFS quotas generous in modern browsers |
| File import behavior | Copy into OPFS for persistence | Users expect vault to persist between visits |
| Save behavior | Explicit save only + dirty indicator | No auto-save; prevents partial writes, matches KDBX user expectations |

## UI/UX Implementation

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Unlock screen | Show vault name + last modified | Entry count requires decryption, can't show pre-unlock |
| Entry fields (MVP) | Title, UserName, Password, URL, Notes, Tags, Icon, Created, Modified | Core fields; skip colors, AutoType, OverrideURL |
| Password field | Reveal toggle + copy button | Industry standard |
| Group reordering | Context menu "Move to..." | Drag-and-drop deferred (complex) |
| Entry history | List with timestamps + restore button | Diff view deferred |
| Search | Substring match on Title, UserName, URL, Notes, Tags | No field-specific query syntax |
| Empty state | "Create your first entry" CTA | No tutorial wizard |

## Password Generator

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Output types | Character-based + passphrase (diceware) | Passphrases critical for master passwords |
| Word list | EFF short word list (~1.3K words, ~10KB) | Well-vetted, small bundle |
| Character options | Uppercase, lowercase, digits, symbols + exclude field | No custom character sets |
| Auto-populate behavior | In entry form → fill field; standalone → clipboard | Context-appropriate behavior |

## Clipboard & Security

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auto-clear timeout | 10 seconds | Matches KeePassXC, shorter = more secure |
| Clipboard API | navigator.clipboard.writeText() | Simple, universal, clear by overwriting |
| Auto-lock timeout | 300 seconds (5 min), configurable | Balance security and usability |
| Lock behavior | Clear all sensitive data from Zustand stores | Zero decrypted data in memory; re-derive on unlock |

## Error Handling & Edge Cases

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Wrong password message | Generic: "Could not open vault" | Don't confirm vault existence or password validity |
| Corrupted file handling | Technical error message, no recovery attempt | Recovery is complex and risky for MVP |
| Browser compatibility | Check Web Crypto + WASM + OPFS on startup | Show "Browser not supported" page if missing |
| Concurrent tabs | OPFS locking, "Vault open in another tab" error | No concurrent edit support for MVP |

## Testing & Compatibility

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Test fixtures | KeePassXC CLI for reference .kdbx + programmatic fixtures | Both real-world and unit test coverage |
| Browser support | Last 2 versions of Chrome, Firefox, Safari, Edge | All support required Web APIs |
| KDF in tests | Mock for unit tests; real WASM for integration tests | Speed vs correctness, both covered |
