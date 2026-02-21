## ADDED: Password Generator

### Requirements

- R1: The system MUST generate character-based passwords with configurable length (default 20 characters)
- R2: The system MUST allow toggling character sets: uppercase (A-Z), lowercase (a-z), digits (0-9), symbols (!@#$%^&*)
- R3: The system MUST allow excluding specific characters (e.g., 0O1lI for readability)
- R4: The system MUST generate diceware-style passphrases using the EFF short word list (~1,300 words)
- R5: The system MUST allow configurable passphrase word count (default 4 words)
- R6: The system MUST allow passphrase word separator (default space, configurable to hyphen, etc.)
- R7: The system MUST use crypto.getRandomValues() for all random selection (never Math.random())
- R8: The system MUST display the generated password/passphrase with a copy button
- R9: The system MUST provide a "regenerate" button to generate a new password
- R10: The system MUST show estimated entropy in bits for the current configuration
- R11: When used from an entry form, the generated password MUST auto-populate the Password field
- R12: When used standalone (from toolbar), the generated password MUST be copied to clipboard

### Scenarios

- S1: WHEN a user generates a 20-character password with all character sets THEN the output contains at least one character from each enabled set
- S2: WHEN a user excludes "0O1lI" THEN none of those characters appear in the generated password
- S3: WHEN a user generates a passphrase with 4 words THEN 4 words from the EFF short list are joined with the separator
- S4: WHEN a user changes the word separator to "-" THEN words are joined with hyphens
- S5: WHEN a user clicks regenerate THEN a new password is generated using fresh randomness
- S6: WHEN entropy is displayed THEN it accurately reflects the configured options (character set size, length, or word list size, word count)
- S7: WHEN used from an entry edit form THEN the generated password fills the Password field
- S8: WHEN used from the toolbar standalone generator THEN the password is copied to clipboard immediately
