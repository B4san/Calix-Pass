import { useUIStore } from '../../stores/uiStore';
import { useSearch } from '../../hooks/useSearch';
import { getEntryTitle, getEntryUsername } from '../../core/model/database';
import { Button } from '../common/Button';

export function EntryList() {
  const { searchQuery, setSearchQuery, setSelectedEntry, selectedEntryUuid, setShowCreateDialog } = useUIStore();
  const { entries } = useSearch();
  
  return (
    <div className="h-full flex flex-col bg-[var(--surface-base)]">
      <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm
                       bg-[var(--surface-inset)]
                       border border-[var(--border-subtle)]
                       rounded-[var(--radius-md)]
                       text-[var(--text-primary)]
                       placeholder:text-[var(--text-muted)]
                       focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-12 h-12 rounded-full bg-[var(--border-subtle)] flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-1">No entries found</p>
            <p className="text-xs text-[var(--text-muted)]">
              {searchQuery ? 'Try a different search term' : 'Create your first entry to get started'}
            </p>
          </div>
        ) : (
          <div className="py-2">
            {entries.map((entry) => (
              <div
                key={entry.uuid}
                onClick={() => setSelectedEntry(entry.uuid)}
                className={`
                  mx-2 px-3 py-2.5 rounded-[var(--radius-md)]
                  cursor-pointer transition-colors duration-[var(--transition-fast)]
                  ${selectedEntryUuid === entry.uuid
                    ? 'bg-[var(--accent-muted)] border border-[var(--accent)]'
                    : 'hover:bg-[var(--border-subtle)] border border-transparent'
                  }
                `}
              >
                <div className="font-medium text-sm text-[var(--text-primary)] truncate">
                  {getEntryTitle(entry)}
                </div>
                {getEntryUsername(entry) && (
                  <div className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                    {getEntryUsername(entry)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-3 border-t border-[var(--border-subtle)]">
        <Button
          variant="primary"
          className="w-full"
          onClick={() => setShowCreateDialog(true)}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Entry
        </Button>
      </div>
    </div>
  );
}
