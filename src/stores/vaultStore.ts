import { create } from 'zustand';
import { Database, KDBXEntry, KDBXGroup, createEmptyDatabase, createGroup } from '../core/model/database';
import { parseKDBX, serializeKDBX, createDefaultHeader, KDBXHeader } from '../core/kdbx/parser';
import { 
  readVaultData, 
  writeVaultData, 
  createVaultMeta, 
  deleteVault,
  VaultMeta, 
  listVaults as listStoredVaults,
  selectFolder,
  checkInitialPath
} from '../storage/electron';

interface VaultState {
  database: Database | null;
  header: KDBXHeader | null;
  vaultMeta: VaultMeta | null;
  masterPassword: string | null;
  isLocked: boolean;
  isLoading: boolean;
  isDirty: boolean;
  lastSavedAt: Date | null;
  error: string | null;
  vaultsPath: string | null;
  needsFolderSelection: boolean;
}

interface VaultActions {
  initApp: () => Promise<void>;
  selectStorageFolder: () => Promise<boolean>;
  createVault: (
    name: string,
    password: string,
    options?: { createStarterGroups?: boolean }
  ) => Promise<void>;
  openVault: (id: string, password: string) => Promise<void>;
  closeVault: () => void;
  lockVault: () => void;
  unlockVault: (password: string) => Promise<void>;
  saveVault: () => Promise<void>;
  
  addEntry: (groupUuid: string, entry: KDBXEntry) => void;
  updateEntry: (entry: KDBXEntry) => void;
  deleteEntry: (entryUuid: string) => void;
  restoreEntry: (entryUuid: string) => void;
  permanentlyDeleteEntry: (entryUuid: string) => void;
  
  addGroup: (parentUuid: string, group: KDBXGroup) => void;
  updateGroup: (group: KDBXGroup) => void;
  deleteGroup: (groupUuid: string) => void;
  restoreGroup: (groupUuid: string) => void;
  permanentlyDeleteGroup: (groupUuid: string) => void;
  emptyRecycleBin: () => void;
  
  setError: (error: string | null) => void;
  markDirty: () => void;
}

const initialState: VaultState = {
  database: null,
  header: null,
  vaultMeta: null,
  masterPassword: null,
  isLocked: false,
  isLoading: false,
  isDirty: false,
  lastSavedAt: null,
  error: null,
  vaultsPath: null,
  needsFolderSelection: false,
};

export const useVaultStore = create<VaultState & VaultActions>((set, get) => ({
  ...initialState,
  
  initApp: async () => {
    set({ isLoading: true });
    try {
      const initialPath = await checkInitialPath();
      if (initialPath) {
        set({ vaultsPath: initialPath, needsFolderSelection: false });
      } else {
        set({ needsFolderSelection: true });
      }
    } finally {
      set({ isLoading: false });
    }
  },
  
  selectStorageFolder: async () => {
    set({ isLoading: true });
    try {
      const result = await selectFolder();
      if (result) {
        set({ 
          vaultsPath: result.path, 
          needsFolderSelection: false,
          isLoading: false 
        });
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (error) {
      set({ isLoading: false, error: (error as Error).message });
      return false;
    }
  },
  
  createVault: async (name: string, password: string, options?: { createStarterGroups?: boolean }) => {
    set({ isLoading: true, error: null });
    let meta: VaultMeta | null = null;
    try {
      meta = await createVaultMeta(name, password);
      const database = createEmptyDatabase(name);
      if (options?.createStarterGroups ?? true) {
        addStarterProjectGroups(database);
      }
      const header = createDefaultHeader();
      
      try {
        const data = await serializeKDBX(database, header, password);
        await writeVaultData(meta.id, data);
      } catch (writeError) {
        try {
          await deleteVault(meta.id);
        } catch {
          // Keep original error as primary failure reason.
        }
        throw writeError;
      }
      
      set({
        database,
        header,
        vaultMeta: meta,
        masterPassword: password,
        isLocked: false,
        isLoading: false,
        isDirty: false,
        lastSavedAt: new Date(),
      });
    } catch (error) {
      set({ isLoading: false, error: (error as Error).message });
      throw error;
    }
  },
  
  openVault: async (id: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await readVaultData(id);
      const { database: parsedDatabase, header } = await parseKDBX(data, password);
      const database = ensureRecycleBin(parsedDatabase);
      
      const vaults = await listStoredVaults();
      const meta = vaults.find(v => v.id === id);
      
      set({
        database,
        header,
        vaultMeta: meta || { id, name: database.meta.databaseName, fileName: `${id}.kdbx`, createdAt: new Date().toISOString(), lastAccessedAt: new Date().toISOString() },
        masterPassword: password,
        isLocked: false,
        isLoading: false,
        isDirty: false,
        lastSavedAt: new Date(),
      });
    } catch (error) {
      set({ isLoading: false, error: (error as Error).message });
      throw error;
    }
  },
  
  closeVault: () => {
    set({
      database: null,
      header: null,
      vaultMeta: null,
      masterPassword: null,
      isLocked: false,
      isDirty: false,
    });
  },
  
  lockVault: () => {
    const { database, header, vaultMeta } = get();
    set({
      database,
      header,
      vaultMeta,
      masterPassword: null,
      isLocked: true,
    });
  },
  
  unlockVault: async (password: string) => {
    const { vaultMeta } = get();
    if (!vaultMeta) return;
    
    set({ isLoading: true, error: null });
    try {
      const data = await readVaultData(vaultMeta.id);
      const { database: parsedDatabase } = await parseKDBX(data, password);
      const database = ensureRecycleBin(parsedDatabase);
      
      set({
        database,
        masterPassword: password,
        isLocked: false,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false, error: (error as Error).message });
      throw error;
    }
  },
  
  saveVault: async () => {
    const { database, header, masterPassword, vaultMeta, isDirty } = get();
    if (!database || !header || !masterPassword || !vaultMeta) return;
    if (!isDirty) return;
    
    set({ isLoading: true });
    try {
      const data = await serializeKDBX(database, header, masterPassword);
      await writeVaultData(vaultMeta.id, data);
      
      set({
        isLoading: false,
        isDirty: false,
        lastSavedAt: new Date(),
      });
    } catch (error) {
      set({ isLoading: false, error: (error as Error).message });
      throw error;
    }
  },
  
  addEntry: (groupUuid: string, entry: KDBXEntry) => {
    const { database } = get();
    if (!database) return;
    
    const group = findGroupByUuid(database.rootGroup, groupUuid);
    if (group) {
      group.entries.push(entry);
      set({ database: { ...database }, isDirty: true });
    }
  },
  
  updateEntry: (entry: KDBXEntry) => {
    const { database } = get();
    if (!database) return;
    
    const existing = findEntryByUuid(database.rootGroup, entry.uuid);
    if (existing) {
      Object.assign(existing, entry);
      existing.lastModificationTime = new Date();
      set({ database: { ...database }, isDirty: true });
    }
  },
  
  deleteEntry: (entryUuid: string) => {
    const { database } = get();
    if (!database) return;
    
    const parent = findParentGroup(database.rootGroup, entryUuid);
    if (parent) {
      const index = parent.entries.findIndex(e => e.uuid === entryUuid);
      if (index !== -1) {
        const [removed] = parent.entries.splice(index, 1);
        const recycleBin = findRecycleBin(database);
        const isAlreadyInRecycleBin = recycleBin?.uuid === parent.uuid;

        if (removed && recycleBin && !isAlreadyInRecycleBin) {
          recycleBin.entries.push(removed);
        }

        set({ database: { ...database }, isDirty: true });
      }
    }
  },

  restoreEntry: (entryUuid: string) => {
    const { database } = get();
    if (!database) return;

    const recycleBin = findRecycleBin(database);
    if (!recycleBin) return;

    const parent = findParentGroup(database.rootGroup, entryUuid);
    if (!parent || parent.uuid !== recycleBin.uuid) return;

    const index = parent.entries.findIndex((entry) => entry.uuid === entryUuid);
    if (index === -1) return;

    const [entry] = parent.entries.splice(index, 1);
    if (!entry) return;

    database.rootGroup.entries.push(entry);
    set({ database: { ...database }, isDirty: true });
  },

  permanentlyDeleteEntry: (entryUuid: string) => {
    const { database } = get();
    if (!database) return;

    const parent = findParentGroup(database.rootGroup, entryUuid);
    if (!parent) return;

    const index = parent.entries.findIndex((entry) => entry.uuid === entryUuid);
    if (index === -1) return;

    parent.entries.splice(index, 1);
    set({ database: { ...database }, isDirty: true });
  },
  
  addGroup: (parentUuid: string, group: KDBXGroup) => {
    const { database } = get();
    if (!database) return;
    
    const parent = findGroupByUuid(database.rootGroup, parentUuid);
    if (parent) {
      parent.groups.push(group);
      set({ database: { ...database }, isDirty: true });
    }
  },
  
  updateGroup: (group: KDBXGroup) => {
    const { database } = get();
    if (!database) return;
    
    const existing = findGroupByUuid(database.rootGroup, group.uuid);
    if (existing) {
      Object.assign(existing, group);
      existing.lastModificationTime = new Date();
      set({ database: { ...database }, isDirty: true });
    }
  },
  
  deleteGroup: (groupUuid: string) => {
    const { database } = get();
    if (!database) return;

    const recycleBin = findRecycleBin(database);
    if (recycleBin && groupUuid === recycleBin.uuid) {
      return;
    }
    
    const parent = findParentGroupForGroup(database.rootGroup, groupUuid);
    if (parent) {
      const index = parent.groups.findIndex(g => g.uuid === groupUuid);
      if (index !== -1) {
        const [removed] = parent.groups.splice(index, 1);
        const isAlreadyInRecycleBin = recycleBin?.uuid === parent.uuid;

        if (removed && recycleBin && !isAlreadyInRecycleBin) {
          recycleBin.groups.push(removed);
        }

        set({ database: { ...database }, isDirty: true });
      }
    }
  },

  restoreGroup: (groupUuid: string) => {
    const { database } = get();
    if (!database) return;

    const recycleBin = findRecycleBin(database);
    if (!recycleBin || groupUuid === recycleBin.uuid) return;

    const parent = findParentGroupForGroup(database.rootGroup, groupUuid);
    if (!parent || parent.uuid !== recycleBin.uuid) return;

    const index = parent.groups.findIndex((group) => group.uuid === groupUuid);
    if (index === -1) return;

    const [group] = parent.groups.splice(index, 1);
    if (!group) return;

    database.rootGroup.groups.push(group);
    set({ database: { ...database }, isDirty: true });
  },

  permanentlyDeleteGroup: (groupUuid: string) => {
    const { database } = get();
    if (!database) return;

    const recycleBin = findRecycleBin(database);
    if (recycleBin && groupUuid === recycleBin.uuid) return;

    const parent = findParentGroupForGroup(database.rootGroup, groupUuid);
    if (!parent) return;

    const index = parent.groups.findIndex((group) => group.uuid === groupUuid);
    if (index === -1) return;

    parent.groups.splice(index, 1);
    set({ database: { ...database }, isDirty: true });
  },

  emptyRecycleBin: () => {
    const { database } = get();
    if (!database) return;

    const recycleBin = findRecycleBin(database);
    if (!recycleBin) return;

    recycleBin.entries = [];
    recycleBin.groups = [];
    recycleBin.lastModificationTime = new Date();
    set({ database: { ...database }, isDirty: true });
  },
  
  setError: (error: string | null) => set({ error }),
  markDirty: () => set({ isDirty: true }),
}));

function findGroupByUuid(root: KDBXGroup, uuid: string): KDBXGroup | undefined {
  if (root.uuid === uuid) return root;
  for (const group of root.groups) {
    const found = findGroupByUuid(group, uuid);
    if (found) return found;
  }
  return undefined;
}

function findEntryByUuid(root: KDBXGroup, uuid: string): KDBXEntry | undefined {
  for (const entry of root.entries) {
    if (entry.uuid === uuid) return entry;
  }
  for (const group of root.groups) {
    const found = findEntryByUuid(group, uuid);
    if (found) return found;
  }
  return undefined;
}

function findParentGroup(root: KDBXGroup, entryUuid: string): KDBXGroup | undefined {
  for (const entry of root.entries) {
    if (entry.uuid === entryUuid) return root;
  }
  for (const group of root.groups) {
    const found = findParentGroup(group, entryUuid);
    if (found) return found;
  }
  return undefined;
}

function findParentGroupForGroup(root: KDBXGroup, groupUuid: string): KDBXGroup | undefined {
  for (const group of root.groups) {
    if (group.uuid === groupUuid) return root;
    const found = findParentGroupForGroup(group, groupUuid);
    if (found) return found;
  }
  return undefined;
}

function findRecycleBin(database: Database): KDBXGroup | undefined {
  const recycleBinUuid = database.meta.recycleBinUuid;
  if (!recycleBinUuid) return undefined;
  return findGroupByUuid(database.rootGroup, recycleBinUuid);
}

function ensureRecycleBin(database: Database): Database {
  if (!database.meta.recycleBinEnabled) {
    return database;
  }

  const existingUuid = database.meta.recycleBinUuid;
  if (existingUuid) {
    const group = findGroupByUuid(database.rootGroup, existingUuid);
    if (group) return database;
  }

  const now = new Date();
  const recycleBin: KDBXGroup = {
    uuid: crypto.randomUUID(),
    name: 'Recycle Bin',
    iconId: 49,
    isExpanded: true,
    creationTime: now,
    lastModificationTime: now,
    groups: [],
    entries: [],
  };

  database.rootGroup.groups.push(recycleBin);
  database.meta.recycleBinUuid = recycleBin.uuid;
  return database;
}

function addStarterProjectGroups(database: Database): void {
  const starterNames = ['Personal', 'Work', 'Projects', 'Finance'];
  const existingNames = new Set(database.rootGroup.groups.map((group) => group.name.toLowerCase()));
  const recycleBin = findRecycleBin(database);
  let insertIndex = recycleBin
    ? database.rootGroup.groups.findIndex((group) => group.uuid === recycleBin.uuid)
    : -1;

  for (const name of starterNames) {
    if (existingNames.has(name.toLowerCase())) {
      continue;
    }

    const group = createGroup(name);
    if (insertIndex >= 0) {
      database.rootGroup.groups.splice(insertIndex, 0, group);
      insertIndex += 1;
    } else {
      database.rootGroup.groups.push(group);
    }
  }
}
