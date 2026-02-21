import { useMemo } from 'react';
import { useVaultStore } from '../stores/vaultStore';
import { useUIStore } from '../stores/uiStore';
import { KDBXEntry, getEntryTitle, getEntryUsername, getEntryUrl, getEntryNotes } from '../core/model/database';

export function useSearch() {
  const { database } = useVaultStore();
  const { searchQuery, selectedGroupUuid } = useUIStore();
  
  const entries = useMemo(() => {
    if (!database) return [];
    
    let allEntries: KDBXEntry[] = [];
    
    const collectEntries = (group: typeof database.rootGroup, includeChildren: boolean = true) => {
      allEntries = [...allEntries, ...group.entries];
      if (includeChildren) {
        for (const child of group.groups) {
          collectEntries(child);
        }
      }
    };
    
    if (selectedGroupUuid) {
      const findGroup = (group: typeof database.rootGroup): typeof database.rootGroup | null => {
        if (group.uuid === selectedGroupUuid) return group;
        for (const child of group.groups) {
          const found = findGroup(child);
          if (found) return found;
        }
        return null;
      };
      
      const selectedGroup = findGroup(database.rootGroup);
      if (selectedGroup) {
        collectEntries(selectedGroup);
      }
    } else {
      collectEntries(database.rootGroup);
    }
    
    return allEntries;
  }, [database, selectedGroupUuid]);
  
  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    
    const query = searchQuery.toLowerCase();
    
    return entries.filter(entry => {
      const title = getEntryTitle(entry).toLowerCase();
      const username = getEntryUsername(entry).toLowerCase();
      const url = getEntryUrl(entry).toLowerCase();
      const notes = getEntryNotes(entry).toLowerCase();
      
      return (
        title.includes(query) ||
        username.includes(query) ||
        url.includes(query) ||
        notes.includes(query) ||
        entry.tags.some(tag => tag.toLowerCase().includes(query))
      );
    });
  }, [entries, searchQuery]);
  
  return { entries: filteredEntries, totalCount: entries.length };
}
