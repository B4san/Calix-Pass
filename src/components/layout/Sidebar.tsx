import { useVaultStore } from '../../stores/vaultStore';
import { useUIStore } from '../../stores/uiStore';
import { findParentGroupForGroup } from '../../core/model/database';
import { Dropdown, DropdownItem, DropdownDivider } from '../common/Dropdown';
import { Button } from '../common/Button';
import {
  FolderClosed,
  Trash2,
  KeyRound,
  LayoutList,
} from 'lucide-react';

interface SidebarProps {
  onExportVault?: () => void;
  onDeleteGroup?: (groupUuid: string) => void;
  onRestoreGroup?: (groupUuid: string) => void;
  onPermanentlyDeleteGroup?: (groupUuid: string) => void;
  onEmptyRecycleBin?: () => void;
  onEditGroup?: (groupUuid: string) => void;
}

export function Sidebar({
  onExportVault,
  onDeleteGroup,
  onRestoreGroup,
  onPermanentlyDeleteGroup,
  onEmptyRecycleBin,
  onEditGroup,
}: SidebarProps) {
  const { database, lockVault } = useVaultStore();
  const { selectedGroupUuid, setSelectedGroup, setShowCreateGroupDialog } = useUIStore();
  
  if (!database) return null;
  
  const recycleBinUuid = database.meta.recycleBinUuid;
  
  const handleSelectGroup = (uuid: string | null) => {
    setSelectedGroup(uuid);
  };

  const isGroupInRecycleBin = (groupUuid: string): boolean => {
    if (!recycleBinUuid) return false;
    let parent = findParentGroupForGroup(database.rootGroup, groupUuid);
    while (parent) {
      if (parent.uuid === recycleBinUuid) {
        return true;
      }
      parent = findParentGroupForGroup(database.rootGroup, parent.uuid);
    }
    return false;
  };
  
  const renderGroup = (group: typeof database.rootGroup, depth: number = 0) => {
    const isSelected = selectedGroupUuid === group.uuid;
    const isRecycleBin = group.uuid === recycleBinUuid;
    const isInsideRecycleBin = isGroupInRecycleBin(group.uuid);
    
    return (
      <div key={group.uuid}>
        <div
          onClick={() => handleSelectGroup(group.uuid)}
          className={`
            group flex items-center gap-2 px-3 py-2 mx-2 rounded-[var(--radius-md)]
            cursor-pointer transition-colors duration-[var(--transition-fast)]
            ${isSelected 
              ? 'bg-[var(--accent-muted)] text-[var(--accent)]' 
              : 'text-[var(--text-secondary)] hover:bg-[var(--border-subtle)] hover:text-[var(--text-primary)]'
            }
          `}
          style={{ paddingLeft: `${12 + depth * 12}px` }}
        >
          <span className="flex-shrink-0 text-[var(--text-secondary)]">
            {group.iconId === 49 ? <Trash2 className="h-4 w-4" /> : group.iconId === 0 ? <KeyRound className="h-4 w-4" /> : <FolderClosed className="h-4 w-4" />}
          </span>
          <span className="truncate text-sm font-medium">{group.name}</span>
          
          {group.entries.length > 0 && (
            <span className="ml-auto text-xs text-[var(--text-muted)] group-hover:hidden">
              {group.entries.length}
            </span>
          )}
          
          {!isRecycleBin && (
            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
              <Dropdown
                trigger={
                  <button className="p-1 rounded hover:bg-[var(--border-default)]">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                }
                align="end"
              >
                {(close) => (
                  <>
                    {isInsideRecycleBin ? (
                      <>
                        <DropdownItem onClick={() => { onRestoreGroup?.(group.uuid); close(); }}>
                          Restore Group
                        </DropdownItem>
                        <DropdownItem danger onClick={() => { onPermanentlyDeleteGroup?.(group.uuid); close(); }}>
                          Delete Permanently
                        </DropdownItem>
                      </>
                    ) : (
                      <>
                        <DropdownItem onClick={() => { setSelectedGroup(group.uuid); setShowCreateGroupDialog(true); close(); }}>
                          New Subgroup
                        </DropdownItem>
                        <DropdownDivider />
                        <DropdownItem onClick={() => { onEditGroup?.(group.uuid); close(); }}>
                          Rename
                        </DropdownItem>
                        <DropdownItem danger onClick={() => { onDeleteGroup?.(group.uuid); close(); }}>
                          Delete
                        </DropdownItem>
                      </>
                    )}
                  </>
                )}
              </Dropdown>
            </div>
          )}
        </div>
        
        {group.groups.map(child => renderGroup(child, depth + 1))}
      </div>
    );
  };
  
  return (
    <div className="h-full flex flex-col bg-[var(--surface-base)]">
      <div className="px-4 py-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-semibold text-[var(--text-primary)]">
            {database.meta.databaseName}
          </h1>
          <Dropdown
            trigger={
              <button className="p-1.5 rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:bg-[var(--border-subtle)] hover:text-[var(--text-primary)] transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            }
            align="end"
          >
            {(close) => (
              <>
                <DropdownItem onClick={() => { lockVault(); close(); }}>
                  Lock Vault
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem onClick={() => { onExportVault?.(); close(); }}>
                  Export Vault
                </DropdownItem>
                <DropdownItem danger onClick={() => { onEmptyRecycleBin?.(); close(); }}>
                  Empty Recycle Bin
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem onClick={close}>
                  Settings
                </DropdownItem>
              </>
            )}
          </Dropdown>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-2">
        <div
          onClick={() => handleSelectGroup(null)}
          className={`
            flex items-center gap-2 px-3 py-2 mx-2 rounded-[var(--radius-md)]
            cursor-pointer transition-colors duration-[var(--transition-fast)]
            ${selectedGroupUuid === null 
              ? 'bg-[var(--accent-muted)] text-[var(--accent)]' 
              : 'text-[var(--text-secondary)] hover:bg-[var(--border-subtle)] hover:text-[var(--text-primary)]'
            }
          `}
        >
          <span className="text-[var(--text-secondary)]"><LayoutList className="h-4 w-4" /></span>
          <span className="text-sm font-medium">All Entries</span>
        </div>
        
        <div className="mt-2">
          {renderGroup(database.rootGroup)}
        </div>
      </div>
      
      <div className="p-3 border-t border-[var(--border-subtle)]">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => { setSelectedGroup(null); setShowCreateGroupDialog(true); }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Group
        </Button>
      </div>
    </div>
  );
}
