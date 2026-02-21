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
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="max-w-md text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center shadow-sm">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-secondary mb-2">Welcome to Calix Pass</h1>
            <p className="text-muted-foreground mb-6">
              Select a folder where your vaults will be stored. This folder will contain your encrypted password files.
            </p>
            <Button variant="primary" size="lg" onClick={handleSelectFolder} loading={isLoading}>
              Select Storage Folder
            </Button>
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
        loading={isLoading}
      />
      
      <ToastContainer />
    </>
  );
}

export default App;
