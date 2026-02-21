## ADDED: Search

### Requirements

- R1: The system MUST provide a search input for finding entries
- R2: The system MUST search across entry fields: Title, UserName, URL, Notes, Tags
- R3: The system MUST perform case-insensitive substring matching
- R4: The system MUST update results in real-time as the user types (debounced)
- R5: The system MUST display matching entries in the entry list area
- R6: The system MUST clear search results and show the current group's entries when search is cleared
- R7: The system MUST search across ALL entries in the vault, not just the current group
- R8: The system MUST highlight matching text in results (optional, nice-to-have)

### Scenarios

- S1: WHEN a user types "github" in the search box THEN all entries with "github" in Title, UserName, URL, Notes, or Tags appear
- S2: WHEN a user types "GITHUB" (uppercase) THEN results match case-insensitively
- S3: WHEN a user clears the search box THEN the current group's entries are displayed
- S4: WHEN a user searches while viewing the Recycle Bin THEN search includes non-deleted entries too
- S5: WHEN no entries match the search term THEN an empty state message is shown
- S6: WHEN a user types rapidly THEN search is debounced to avoid excessive filtering
