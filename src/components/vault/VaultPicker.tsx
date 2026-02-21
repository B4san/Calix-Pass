import { useMemo, useState } from 'react';
import { VaultMeta } from '../../storage/electron';
import { Button } from '../common/Button';

interface VaultPickerProps {
  vaults: VaultMeta[];
  onSelectVault: (id: string) => void;
  onCreateVault: () => void;
  onImportVault: () => void;
  onChangeFolder: () => void;
  currentPath: string | null;
}

export function VaultPicker({
  vaults,
  onSelectVault,
  onCreateVault,
  onImportVault,
  onChangeFolder,
  currentPath,
}: VaultPickerProps) {
  const [query, setQuery] = useState('');
  const [selectedVaultId, setSelectedVaultId] = useState<string | null>(null);

  const filteredVaults = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return vaults;
    return vaults.filter((vault) => vault.name.toLowerCase().includes(normalized));
  }, [vaults, query]);

  const selectedVault = useMemo(
    () => filteredVaults.find((vault) => vault.id === selectedVaultId) || filteredVaults[0] || null,
    [filteredVaults, selectedVaultId]
  );

  const handleDelete = async (id: string, name: string) => {
    const { deleteVault } = await import('../../storage/electron');
    if (confirm(`Delete "${name}"? This cannot be undone.`)) {
      await deleteVault(id);
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-app-canvas p-4 md:p-8">
      <div className="mx-auto grid h-[calc(100vh-2rem)] max-w-[1240px] grid-cols-1 overflow-hidden rounded-3xl border border-[#d7dbe6] bg-white shadow-[0_28px_70px_rgba(8,25,66,0.12)] md:h-[calc(100vh-4rem)] md:grid-cols-[230px_1fr_300px]">
        <aside className="hidden border-r border-[#e9ecf3] bg-[#fbfcff] p-5 md:block">
          <div className="mb-8 flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-[#2756f6] text-white grid place-items-center text-xs font-bold">CP</div>
            <div>
              <p className="text-sm font-semibold text-[#1b2435]">Calix Pass</p>
              <p className="text-xs text-[#7c8599]">Secure Vault Space</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <NavItem label="All Vaults" active />
            <NavItem label="Recent" />
            <NavItem label="Favorites" />
            <NavItem label="Shared" />
            <NavItem label="Tags" />
          </div>
          <div className="mt-8 rounded-2xl border border-[#e4e8f2] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6e7890]">Storage Folder</p>
            <p className="mt-2 text-xs text-[#8a93a9] break-all">{currentPath || 'No folder selected'}</p>
            <Button variant="ghost" className="mt-3 w-full justify-center !rounded-xl !text-xs" onClick={onChangeFolder}>
              Change Folder
            </Button>
          </div>
        </aside>

        <main className="overflow-auto p-4 md:p-6">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-[#1b2435] md:text-2xl">Your Vaults</h1>
              <p className="text-sm text-[#79839a]">Create, import, and unlock encrypted vault files.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="!rounded-xl" onClick={onImportVault}>Import</Button>
              <Button variant="primary" className="!rounded-xl" onClick={onCreateVault}>Create Vault</Button>
            </div>
          </div>

          <div className="mb-5 rounded-2xl border border-[#e4e8f2] bg-[#f8faff] p-3">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search vaults..."
              className="w-full rounded-xl border border-[#dce3f1] bg-white px-4 py-2.5 text-sm text-[#1f2a3d] placeholder:text-[#90a0bb] focus:border-[#2756f6] focus:outline-none focus:ring-2 focus:ring-[#2756f6]/20"
            />
          </div>

          <div className="rounded-2xl border border-[#e4e8f2] bg-white">
            <div className="grid grid-cols-[1fr_auto_auto] border-b border-[#edf0f7] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#8993a9]">
              <span>Name</span>
              <span className="w-28 text-right">Modified</span>
              <span className="w-16 text-right">Actions</span>
            </div>
            <div>
              {filteredVaults.length > 0 ? (
                filteredVaults.map((vault) => {
                  const active = selectedVault?.id === vault.id;
                  return (
                    <div
                      key={vault.id}
                      className={`grid cursor-pointer grid-cols-[1fr_auto_auto] items-center px-4 py-3 text-sm transition-colors ${
                        active ? 'bg-[#edf3ff]' : 'hover:bg-[#f8faff]'
                      }`}
                      onClick={() => setSelectedVaultId(vault.id)}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="h-8 w-8 rounded-md bg-[#eaf0ff] text-[#2756f6] grid place-items-center">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h6l2 2h10v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-[#1f2a3d]">{vault.name}</p>
                          <p className="text-xs text-[#8792a9]">{vault.fileName}</p>
                        </div>
                      </div>
                      <span className="w-28 text-right text-xs text-[#7e88a0]">{formatRelativeTime(vault.lastAccessedAt)}</span>
                      <div className="flex w-16 items-center justify-end gap-1">
                        <button
                          className="rounded-lg p-1.5 text-[#7d89a3] hover:bg-[#edf3ff] hover:text-[#2756f6]"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectVault(vault.id);
                          }}
                          title="Unlock vault"
                          aria-label="Unlock vault"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </button>
                        <button
                          className="rounded-lg p-1.5 text-[#7d89a3] hover:bg-[#ffeef0] hover:text-[#d83751]"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(vault.id, vault.name);
                          }}
                          title="Delete vault"
                          aria-label="Delete vault"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="px-6 py-10 text-center">
                  <p className="text-sm font-medium text-[#58627a]">
                    {vaults.length === 0 ? 'No vaults yet' : 'No vaults match your search'}
                  </p>
                  <p className="mt-1 text-xs text-[#8c96ad]">Create or import a vault to continue.</p>
                </div>
              )}
            </div>
          </div>
        </main>

        <aside className="hidden border-l border-[#e9ecf3] bg-[#fcfdff] p-5 md:block">
          <h2 className="text-base font-semibold text-[#1e283a]">Vault Details</h2>
          {selectedVault ? (
            <div className="mt-4 rounded-2xl border border-[#e4e8f2] bg-white p-4">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf3ff] text-[#2756f6]">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h6l2 2h10v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                </svg>
              </div>
              <p className="text-base font-semibold text-[#1f2a3d]">{selectedVault.name}</p>
              <p className="mt-1 text-xs text-[#7c879f]">{selectedVault.fileName}</p>
              <div className="mt-4 space-y-2 text-xs text-[#68748e]">
                <p>Created: {new Date(selectedVault.createdAt).toLocaleString()}</p>
                <p>Last accessed: {new Date(selectedVault.lastAccessedAt).toLocaleString()}</p>
              </div>
              <Button variant="primary" className="mt-4 w-full !rounded-xl justify-center" onClick={() => onSelectVault(selectedVault.id)}>
                Unlock Vault
              </Button>
            </div>
          ) : (
            <p className="mt-3 text-sm text-[#8290aa]">Select a vault to view details.</p>
          )}
        </aside>
      </div>
    </div>
  );
}

function NavItem({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div
      className={`rounded-xl px-3 py-2 transition-colors ${
        active ? 'bg-[#edf3ff] text-[#2756f6] font-medium' : 'text-[#6f7990] hover:bg-[#f3f6fd]'
      }`}
    >
      {label}
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
