import { VaultMeta } from '../../storage/electron';
import { useMemo, useState } from 'react';
import { Button } from '../common/Button';

interface VaultPickerProps {
  vaults: VaultMeta[];
  onSelectVault: (id: string) => void;
  onCreateVault: () => void;
  onImportVault: () => void;
  onChangeFolder: () => void;
  currentPath: string | null;
}

export function VaultPicker({ vaults, onSelectVault, onCreateVault, onImportVault, onChangeFolder, currentPath }: VaultPickerProps) {
  const [query, setQuery] = useState('');

  const filteredVaults = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return vaults;
    }
    return vaults.filter((vault) => vault.name.toLowerCase().includes(normalized));
  }, [vaults, query]);

  const handleDelete = async (id: string, name: string) => {
    const { deleteVault } = await import('../../storage/electron');
    if (confirm(`Delete "${name}"? This cannot be undone.`)) {
      await deleteVault(id);
      window.location.reload();
    }
  };
  
  return (
    <div className="min-h-screen bg-[var(--surface-base)] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[var(--navy-mid)] to-[var(--navy-deep)] flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-[var(--amber-400)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Calix Pass</h1>
          <p className="text-[var(--text-secondary)] mt-1">Secure password manager</p>
          {currentPath && (
            <p className="text-xs text-[var(--text-muted)] mt-2 truncate" title={currentPath}>
              📁 {currentPath}
            </p>
          )}
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter vaults..."
            className="w-full px-3 py-2 text-sm bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>
        
        {filteredVaults.length > 0 ? (
          <div className="space-y-2 mb-6">
            {filteredVaults.map((vault) => (
              <div
                key={vault.id}
                className="group flex items-center gap-3 p-4 bg-[var(--surface-elevated)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-md)] transition-shadow cursor-pointer"
                onClick={() => onSelectVault(vault.id)}
              >
                <div className="w-10 h-10 rounded-lg bg-[var(--navy-deep)] flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[var(--amber-400)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-[var(--text-primary)] truncate">{vault.name}</h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Last accessed {formatRelativeTime(vault.lastAccessedAt)}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(vault.id, vault.name); }}
                  className="p-2 rounded-[var(--radius-md)] text-[var(--text-muted)] hover:text-[var(--error)] hover:bg-[var(--error-muted)] opacity-0 group-hover:opacity-100 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 mb-6">
            <p className="text-[var(--text-secondary)]">
              {vaults.length === 0 ? 'No vaults yet' : 'No vaults match your search'}
            </p>
            <p className="text-sm text-[var(--text-muted)] mt-1">Create or import a vault to get started</p>
          </div>
        )}
        
        <div className="space-y-2">
          <Button variant="primary" className="w-full justify-center" onClick={onCreateVault}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Vault
          </Button>
          <Button variant="secondary" className="w-full justify-center" onClick={onImportVault}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import Vault
          </Button>
          <Button variant="ghost" className="w-full justify-center text-[var(--text-muted)]" onClick={onChangeFolder}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Change Storage Folder
          </Button>
        </div>
      </div>
    </div>
  );
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
