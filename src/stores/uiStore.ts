import { create } from 'zustand';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface UIState {
  selectedEntryUuid: string | null;
  selectedGroupUuid: string | null;
  searchQuery: string;
  isSearchOpen: boolean;
  showCreateDialog: boolean;
  showEditDialog: boolean;
  showDeleteConfirm: boolean;
  showPasswordGenerator: boolean;
  showCreateGroupDialog: boolean;
  sidebarCollapsed: boolean;
  toasts: ToastMessage[];
  
  setSelectedEntry: (uuid: string | null) => void;
  setSelectedGroup: (uuid: string | null) => void;
  setSearchQuery: (query: string) => void;
  toggleSearch: () => void;
  setShowCreateDialog: (show: boolean) => void;
  setShowEditDialog: (show: boolean) => void;
  setShowDeleteConfirm: (show: boolean) => void;
  setShowPasswordGenerator: (show: boolean) => void;
  setShowCreateGroupDialog: (show: boolean) => void;
  toggleSidebar: () => void;
  
  addToast: (message: string, type: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  selectedEntryUuid: null,
  selectedGroupUuid: null,
  searchQuery: '',
  isSearchOpen: false,
  showCreateDialog: false,
  showEditDialog: false,
  showDeleteConfirm: false,
  showPasswordGenerator: false,
  showCreateGroupDialog: false,
  sidebarCollapsed: false,
  toasts: [],
  
  setSelectedEntry: (uuid) => set({ selectedEntryUuid: uuid }),
  setSelectedGroup: (uuid) => set({ selectedGroupUuid: uuid }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleSearch: () => set((s) => ({ isSearchOpen: !s.isSearchOpen })),
  setShowCreateDialog: (show) => set({ showCreateDialog: show }),
  setShowEditDialog: (show) => set({ showEditDialog: show }),
  setShowDeleteConfirm: (show) => set({ showDeleteConfirm: show }),
  setShowPasswordGenerator: (show) => set({ showPasswordGenerator: show }),
  setShowCreateGroupDialog: (show) => set({ showCreateGroupDialog: show }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  
  addToast: (message, type) => {
    const id = crypto.randomUUID();
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => get().removeToast(id), 4000);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
