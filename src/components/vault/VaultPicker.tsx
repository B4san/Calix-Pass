import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  FolderClosed,
  Clock3,
  Star,
  Share2,
  Tags,
  Lock,
  Trash2,
  FolderOpen,
  Search,
  ShieldCheck,
  PencilLine,
  CheckCircle2,
} from 'lucide-react';
import { VaultMeta } from '../../storage/electron';
import { Button } from '../common/Button';
import {
  createDefaultVaultPickerPrefs,
  filterVaultsByView,
  normalizeTags,
  type VaultPickerPrefs,
  type VaultSidebarFilter,
} from './vaultPickerUtils';

interface VaultPickerProps {
  vaults: VaultMeta[];
  onSelectVault: (id: string) => void;
  onCreateVault: () => void;
  onImportVault: () => void;
  onChangeFolder: () => void;
  currentPath: string | null;
}

const PREFS_STORAGE_KEY = 'calix:vault-picker-prefs';

export function VaultPicker({
  vaults,
  onSelectVault,
  onCreateVault,
  onImportVault,
  onChangeFolder,
  currentPath,
}: VaultPickerProps) {
  const [query, setQuery] = useState('');
  const [view, setView] = useState<VaultSidebarFilter>('all');
  const [selectedVaultId, setSelectedVaultId] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<VaultPickerPrefs>(() => {
    try {
      const raw = localStorage.getItem(PREFS_STORAGE_KEY);
      return raw ? JSON.parse(raw) as VaultPickerPrefs : createDefaultVaultPickerPrefs();
    } catch {
      return createDefaultVaultPickerPrefs();
    }
  });
  const [tagsDraft, setTagsDraft] = useState('');

  useEffect(() => {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
  }, [prefs]);

  const filteredVaults = useMemo(
    () => filterVaultsByView(vaults, query, view, prefs),
    [vaults, query, view, prefs]
  );

  const selectedVault = useMemo(
    () => filteredVaults.find((vault) => vault.id === selectedVaultId) || filteredVaults[0] || null,
    [filteredVaults, selectedVaultId]
  );

  useEffect(() => {
    if (!selectedVault) return;
    const tags = prefs.tags[selectedVault.id] || [];
    setTagsDraft(tags.join(', '));
  }, [selectedVault?.id, prefs.tags]);

  const handleDelete = async (id: string, name: string) => {
    const { deleteVault } = await import('../../storage/electron');
    if (confirm(`Delete "${name}"? This cannot be undone.`)) {
      await deleteVault(id);
      window.location.reload();
    }
  };

  const toggleFavorite = (vaultId: string) => {
    setPrefs((prev) => ({
      ...prev,
      favorites: prev.favorites.includes(vaultId)
        ? prev.favorites.filter((id) => id !== vaultId)
        : [...prev.favorites, vaultId],
    }));
  };

  const toggleShared = (vaultId: string) => {
    setPrefs((prev) => ({
      ...prev,
      shared: prev.shared.includes(vaultId)
        ? prev.shared.filter((id) => id !== vaultId)
        : [...prev.shared, vaultId],
    }));
  };

  const saveTags = (vaultId: string) => {
    const tags = normalizeTags(tagsDraft);
    setPrefs((prev) => ({
      ...prev,
      tags: {
        ...prev.tags,
        [vaultId]: tags,
      },
    }));
  };

  return (
    <div className="min-h-screen bg-app-canvas p-4 md:p-8">
      <div className="mx-auto grid h-[calc(100vh-2rem)] max-w-[1240px] grid-cols-1 overflow-hidden rounded-3xl border border-[#d7dbe6] bg-white shadow-[0_28px_70px_rgba(8,25,66,0.12)] md:h-[calc(100vh-4rem)] md:grid-cols-[240px_1fr_320px]">
        <aside className="hidden border-r border-[#e9ecf3] bg-[#fbfcff] p-5 md:block">
          <div className="mb-8 flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-[#2756f6] text-white">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1b2435]">Calix Pass</p>
              <p className="text-xs text-[#7c8599]">Secure Vault Space</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <SidebarFilter
              label="All Vaults"
              active={view === 'all'}
              icon={<FolderClosed className="h-4 w-4" />}
              onClick={() => setView('all')}
            />
            <SidebarFilter
              label="Recent"
              active={view === 'recent'}
              icon={<Clock3 className="h-4 w-4" />}
              onClick={() => setView('recent')}
            />
            <SidebarFilter
              label="Favorites"
              active={view === 'favorites'}
              icon={<Star className="h-4 w-4" />}
              onClick={() => setView('favorites')}
            />
            <SidebarFilter
              label="Shared"
              active={view === 'shared'}
              icon={<Share2 className="h-4 w-4" />}
              onClick={() => setView('shared')}
            />
            <SidebarFilter
              label="Tagged"
              active={view === 'tagged'}
              icon={<Tags className="h-4 w-4" />}
              onClick={() => setView('tagged')}
            />
          </div>

          <div className="mt-8 rounded-2xl border border-[#e4e8f2] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6e7890]">Storage Folder</p>
            <p className="mt-2 break-all text-xs text-[#8a93a9]">{currentPath || 'No folder selected'}</p>
            <Button variant="ghost" className="mt-3 w-full justify-center !rounded-xl !text-xs" onClick={onChangeFolder}>
              <FolderOpen className="h-4 w-4" />
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
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7f8ca7]" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search vaults..."
                className="w-full rounded-xl border border-[#dce3f1] bg-white py-2.5 pl-10 pr-4 text-sm text-[#1f2a3d] placeholder:text-[#90a0bb] focus:border-[#2756f6] focus:outline-none focus:ring-2 focus:ring-[#2756f6]/20"
              />
            </label>
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
                        <div className="grid h-8 w-8 place-items-center rounded-md bg-[#eaf0ff] text-[#2756f6]">
                          <FolderClosed className="h-4 w-4" />
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
                          <Lock className="h-4 w-4" />
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
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="px-6 py-10 text-center">
                  <p className="text-sm font-medium text-[#58627a]">
                    {vaults.length === 0 ? 'No vaults yet' : 'No vaults match this filter'}
                  </p>
                  <p className="mt-1 text-xs text-[#8c96ad]">Try another filter or create/import a vault.</p>
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
                <FolderClosed className="h-5 w-5" />
              </div>
              <p className="text-base font-semibold text-[#1f2a3d]">{selectedVault.name}</p>
              <p className="mt-1 text-xs text-[#7c879f]">{selectedVault.fileName}</p>

              <div className="mt-4 flex gap-2">
                <Button
                  variant={prefs.favorites.includes(selectedVault.id) ? 'primary' : 'secondary'}
                  className="!rounded-xl !px-3 !py-1.5 !text-xs"
                  onClick={() => toggleFavorite(selectedVault.id)}
                >
                  <Star className="h-3.5 w-3.5" />
                  Favorite
                </Button>
                <Button
                  variant={prefs.shared.includes(selectedVault.id) ? 'primary' : 'secondary'}
                  className="!rounded-xl !px-3 !py-1.5 !text-xs"
                  onClick={() => toggleShared(selectedVault.id)}
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Shared
                </Button>
              </div>

              <div className="mt-4">
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-[#7181a0]">
                  Tags (comma separated)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagsDraft}
                    onChange={(event) => setTagsDraft(event.target.value)}
                    placeholder="work, finance"
                    className="min-w-0 flex-1 rounded-xl border border-[#dce3f1] bg-white px-3 py-2 text-xs text-[#1f2a3d] placeholder:text-[#97a4bc] focus:border-[#2756f6] focus:outline-none focus:ring-2 focus:ring-[#2756f6]/20"
                  />
                  <Button
                    variant="secondary"
                    className="!rounded-xl !px-3 !py-2 !text-xs"
                    onClick={() => saveTags(selectedVault.id)}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Save
                  </Button>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs text-[#68748e]">
                <p>Created: {new Date(selectedVault.createdAt).toLocaleString()}</p>
                <p>Last accessed: {new Date(selectedVault.lastAccessedAt).toLocaleString()}</p>
              </div>
              <Button variant="primary" className="mt-4 w-full justify-center !rounded-xl" onClick={() => onSelectVault(selectedVault.id)}>
                <Lock className="h-4 w-4" />
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

function SidebarFilter({
  label,
  active,
  icon,
  onClick,
}: {
  label: string;
  active: boolean;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition-colors ${
        active ? 'bg-[#edf3ff] text-[#2756f6] font-medium' : 'text-[#6f7990] hover:bg-[#f3f6fd]'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
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
