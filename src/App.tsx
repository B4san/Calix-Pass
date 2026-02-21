import { useState, useEffect } from 'react';
import { useVaultStore } from './stores/vaultStore';
import { useUIStore } from './stores/uiStore';
import { useAutoSave } from './hooks/useAutoSave';
import { useAutoLock } from './hooks/useAutoLock';
import {
  listVaults,
  importVaultFile,
  exportVaultFile,
  writeExportFile,
  selectExportFile,
  VaultMeta,
} from './storage/electron';
import { AppShell } from './components/layout/AppShell';
import { ToastContainer } from './components/common/Toast';
import { VaultPicker } from './components/vault/VaultPicker';
import { UnlockDialog, CreateVaultDialog } from './components/vault/UnlockDialog';
import { PasswordGenerator } from './components/generator/PasswordGenerator';
import { EntryForm } from './components/entry/EntryForm';
import { GroupForm } from './components/group/GroupForm';
import { Dialog } from './components/common/Dialog';
import { Button } from './components/common/Button';
import {
  findEntryByUuid,
  findGroupByUuid,
  findParentGroupForGroup,
  KDBXEntry,
  KDBXGroup,
} from './core/model/database';

function App() {
  const { 
    database, 
    isLocked, 
    isLoading,
    error,
    needsFolderSelection,
    vaultsPath,
    initApp,
    selectStorageFolder,
    createVault, 
    openVault, 
    lockVault,
    addEntry,
    updateEntry,
    deleteEntry,
    addGroup,
    updateGroup,
    deleteGroup,
    restoreGroup,
    permanentlyDeleteGroup,
    emptyRecycleBin,
    closeVault,
  } = useVaultStore();
  
  const {
    selectedGroupUuid,
    selectedEntryUuid,
    showCreateDialog,
    showEditDialog,
    showDeleteConfirm,
    showPasswordGenerator,
    showCreateGroupDialog,
    setShowCreateDialog,
    setShowEditDialog,
    setShowDeleteConfirm,
    setShowPasswordGenerator,
    setShowCreateGroupDialog,
    setSelectedEntry,
    addToast,
  } = useUIStore();
  
  const [view, setView] = useState<'init' | 'picker' | 'unlock' | 'main'>('init');
  const [selectedVaultId, setSelectedVaultId] = useState<string | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [editingGroupUuid, setEditingGroupUuid] = useState<string | null>(null);
  const [vaults, setVaults] = useState<VaultMeta[]>([]);
  
  useAutoSave();
  useAutoLock();
  
  useEffect(() => {
    initApp();
  }, []);
  
  useEffect(() => {
    if (needsFolderSelection) {
      setView('init');
    } else if (database && !isLocked) {
      setView('main');
    } else if (database && isLocked) {
      setView('unlock');
    } else if (vaultsPath) {
      setView('picker');
      loadVaults();
    }
  }, [database, isLocked, needsFolderSelection, vaultsPath]);
  
  const loadVaults = async () => {
    try {
      const loaded = await listVaults();
      setVaults(loaded.sort((a, b) => 
        new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime()
      ));
    } catch (error) {
      console.error('Failed to load vaults:', error);
    }
  };
  
  const handleSelectFolder = async () => {
    const success = await selectStorageFolder();
    if (success) {
      loadVaults();
    }
  };
  
  const handleSelectVault = (id: string) => {
    setSelectedVaultId(id);
    setView('unlock');
  };
  
  const handleUnlock = async (password: string) => {
    if (!selectedVaultId) return;
    await openVault(selectedVaultId, password);
  };
  
  const handleCreateVault = async (name: string, password: string, createStarterGroups: boolean) => {
    await createVault(name, password, { createStarterGroups });
    loadVaults();
  };
  
  const handleImportVault = async () => {
    try {
      const meta = await importVaultFile();
      if (meta) {
        loadVaults();
        addToast('Vault imported successfully', 'success');
      }
    } catch (error) {
      addToast('Failed to import vault', 'error');
    }
  };
  
  const handleExportVault = async () => {
    if (!database) return;
    try {
      const vaultMeta = useVaultStore.getState().vaultMeta;
      if (!vaultMeta) return;
      
      const { data, name } = await exportVaultFile(vaultMeta.id);
      const filePath = await selectExportFile(name);
      
      if (filePath) {
        await writeExportFile(filePath, data);
        addToast('Vault exported successfully', 'success');
      }
    } catch (error) {
      addToast('Failed to export vault', 'error');
    }
  };
  
  const handleSaveEntry = (entry: KDBXEntry) => {
    const existingEntry = selectedEntryUuid ? findEntryByUuid(database!.rootGroup, selectedEntryUuid) : null;
    
    if (existingEntry) {
      updateEntry(entry);
      addToast('Entry updated', 'success');
    } else {
      const targetGroupUuid = selectedGroupUuid || database!.rootGroup.uuid;
      addEntry(targetGroupUuid, entry);
      setSelectedEntry(entry.uuid);
      addToast('Entry created', 'success');
    }
  };
  
  const handleDeleteEntry = () => {
    if (!selectedEntryUuid) return;
    deleteEntry(selectedEntryUuid);
    setSelectedEntry(null);
    setShowDeleteConfirm(false);
    addToast('Entry moved to Recycle Bin', 'success');
  };
  
  const handlePasswordGenerated = (password: string) => {
    setGeneratedPassword(password);
  };
  
  const handleSaveGroup = (group: KDBXGroup) => {
    if (editingGroupUuid) {
      updateGroup(group);
      addToast('Group updated', 'success');
    } else {
      const targetParentUuid = selectedGroupUuid || database!.rootGroup.uuid;
      addGroup(targetParentUuid, group);
      addToast('Group created', 'success');
    }
    setEditingGroupUuid(null);
  };
  
  const handleDeleteGroup = (groupUuid: string) => {
    if (!database) return;
    const group = findGroupByUuid(database.rootGroup, groupUuid);
    if (!group) return;

    const recycleBinUuid = database.meta.recycleBinUuid;
    const parent = findParentGroupForGroup(database.rootGroup, groupUuid);
    const isInRecycleBin = !!recycleBinUuid && parent?.uuid === recycleBinUuid;

    if (isInRecycleBin) {
      if (confirm(`Permanently delete "${group.name}"? This cannot be undone.`)) {
        permanentlyDeleteGroup(groupUuid);
        if (selectedGroupUuid === groupUuid) {
          useUIStore.getState().setSelectedGroup(null);
        }
        addToast('Group permanently deleted', 'success');
      }
      return;
    }

    if (confirm(`Move "${group.name}" to Recycle Bin?`)) {
      deleteGroup(groupUuid);
      if (selectedGroupUuid === groupUuid) {
        useUIStore.getState().setSelectedGroup(null);
      }
      addToast('Group moved to Recycle Bin', 'success');
    }
  };

  const handleRestoreGroup = (groupUuid: string) => {
    restoreGroup(groupUuid);
    addToast('Group restored', 'success');
  };

  const handlePermanentDeleteGroup = (groupUuid: string) => {
    if (confirm('Permanently delete this group? This cannot be undone.')) {
      permanentlyDeleteGroup(groupUuid);
      if (selectedGroupUuid === groupUuid) {
        useUIStore.getState().setSelectedGroup(null);
      }
      addToast('Group permanently deleted', 'success');
    }
  };

  const handleEmptyRecycleBin = () => {
    if (confirm('Empty Recycle Bin permanently? This cannot be undone.')) {
      emptyRecycleBin();
      addToast('Recycle Bin emptied', 'success');
    }
  };
  
  const selectedEntry = selectedEntryUuid && database 
    ? findEntryByUuid(database.rootGroup, selectedEntryUuid) 
    : null;
  
  const editingGroup = editingGroupUuid && database
    ? findGroupByUuid(database.rootGroup, editingGroupUuid)
    : null;
  
  const getVaultName = (id: string): string => {
    const vault = vaults.find(v => v.id === id);
    return vault?.name || 'Vault';
  };
  
  return (
    <>
      {view === 'init' && (
        <div className="min-h-screen bg-app-canvas flex items-center justify-center p-6">
          <div className="w-full max-w-[880px] rounded-3xl border border-[#d8deec] bg-white p-8 shadow-[0_28px_70px_rgba(8,25,66,0.15)] md:p-10">
            <div className="mb-10 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#2756f6] text-white grid place-items-center text-sm font-bold">CP</div>
              <div>
                <h1 className="text-xl font-semibold text-[#1e2a3d]">Calix Pass</h1>
                <p className="text-sm text-[#74819b]">Desktop Password Vault</p>
              </div>
            </div>
            <div className="grid gap-8 md:grid-cols-[1.1fr_1fr]">
              <div>
                <h2 className="text-3xl font-semibold leading-tight text-[#1f2a3d]">Choose where your encrypted vaults live.</h2>
                <p className="mt-4 text-sm leading-6 text-[#6f7b93]">
                  Select a dedicated folder for your vault files and metadata. Calix Pass keeps your
                  credentials encrypted at rest and only unlocks them with your master password.
                </p>
                <Button variant="primary" size="lg" className="mt-7 !rounded-xl" onClick={handleSelectFolder} loading={isLoading}>
                  Select Storage Folder
                </Button>
              </div>
              <div className="rounded-2xl border border-[#e4e8f2] bg-[#f8faff] p-5">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf3ff]">
                  <svg className="w-7 h-7 text-[#2756f6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7h6l2 2h10v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-[#2b3751]">Recommended setup</p>
                <ul className="mt-3 space-y-2 text-sm text-[#64728d]">
                  <li>Use an empty folder dedicated to vault storage.</li>
                  <li>Keep backups in another physical location.</li>
                  <li>Avoid shared folders unless strictly necessary.</li>
                </ul>
              </div>
            </div>
            <div className="mt-8 rounded-2xl border border-[#e6eaf4] bg-[#fbfcff] p-4 text-xs text-[#7f8aa3]">
              Folder content: `vaults.json` metadata + encrypted `.kdbx` files.
            </div>
          </div>
        </div>
      )}
      
      {view === 'picker' && (
        <VaultPicker
          vaults={vaults}
          onSelectVault={handleSelectVault}
          onCreateVault={() => setShowCreateDialog(true)}
          onImportVault={handleImportVault}
          onChangeFolder={handleSelectFolder}
          currentPath={vaultsPath}
        />
      )}
      
      {view === 'unlock' && selectedVaultId && (
        <UnlockDialog
          open={true}
          vaultName={getVaultName(selectedVaultId)}
          onUnlock={handleUnlock}
          onCancel={() => { setSelectedVaultId(null); setView('picker'); }}
          error={error || undefined}
          loading={isLoading}
        />
      )}
      
      {view === 'main' && database && (
        <AppShell 
          onExportVault={handleExportVault}
          onDeleteGroup={handleDeleteGroup}
          onRestoreGroup={handleRestoreGroup}
          onPermanentlyDeleteGroup={handlePermanentDeleteGroup}
          onEmptyRecycleBin={handleEmptyRecycleBin}
          onEditGroup={(uuid: string) => { setEditingGroupUuid(uuid); setShowCreateGroupDialog(true); }}
        >
          <EntryForm
            open={showCreateDialog || showEditDialog}
            entry={showEditDialog ? selectedEntry : null}
            groupUuid={selectedGroupUuid || database.rootGroup.uuid}
            onSave={handleSaveEntry}
            onClose={() => { setShowCreateDialog(false); setShowEditDialog(false); setGeneratedPassword(null); }}
            onOpenGenerator={() => setShowPasswordGenerator(true)}
            generatedPassword={generatedPassword}
            onPasswordUsed={() => setGeneratedPassword(null)}
          />
          
          <GroupForm
            open={showCreateGroupDialog}
            group={editingGroup}
            parentUuid={selectedGroupUuid || database.rootGroup.uuid}
            onSave={handleSaveGroup}
            onClose={() => { setShowCreateGroupDialog(false); setEditingGroupUuid(null); }}
          />
          
          <PasswordGenerator
            open={showPasswordGenerator}
            onClose={() => setShowPasswordGenerator(false)}
            onSelect={handlePasswordGenerated}
          />
          
          <Dialog
            open={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            title="Delete Entry"
            size="sm"
          >
            <p className="text-sm text-muted-foreground mb-4">
              Move this entry to Recycle Bin?
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="danger" className="flex-1" onClick={handleDeleteEntry}>
                Move to Bin
              </Button>
            </div>
          </Dialog>
        </AppShell>
      )}
      
      <CreateVaultDialog
        open={showCreateDialog && view === 'picker'}
        onCreate={handleCreateVault}
        onClose={() => setShowCreateDialog(false)}
        error={error || undefined}
        loading={isLoading}
      />
      
      <ToastContainer />
    </>
  );
}

export default App;
