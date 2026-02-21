import { type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { EntryList } from './EntryList';
import { DetailPanel } from './DetailPanel';
import { useVaultStore } from '../../stores/vaultStore';
import { useUIStore } from '../../stores/uiStore';

interface AppShellProps {
  children?: ReactNode;
  onExportVault?: () => void;
  onDeleteGroup?: (groupUuid: string) => void;
  onRestoreGroup?: (groupUuid: string) => void;
  onPermanentlyDeleteGroup?: (groupUuid: string) => void;
  onEmptyRecycleBin?: () => void;
  onEditGroup?: (groupUuid: string) => void;
}

export function AppShell({
  children,
  onExportVault,
  onDeleteGroup,
  onRestoreGroup,
  onPermanentlyDeleteGroup,
  onEmptyRecycleBin,
  onEditGroup,
}: AppShellProps) {
  const { database, isLocked } = useVaultStore();
  const { sidebarCollapsed } = useUIStore();
  
  if (isLocked || !database) {
    return <>{children}</>;
  }
  
  return (
    <div className="h-screen flex bg-background text-secondary font-sans overflow-hidden">
      <div 
        className={`
          flex-shrink-0 border-r border-border-subtle bg-white
          transition-[width] duration-200 ease-out
          ${sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-64'}
        `}
      >
        <Sidebar
          onExportVault={onExportVault}
          onDeleteGroup={onDeleteGroup}
          onRestoreGroup={onRestoreGroup}
          onPermanentlyDeleteGroup={onPermanentlyDeleteGroup}
          onEmptyRecycleBin={onEmptyRecycleBin}
          onEditGroup={onEditGroup}
        />
      </div>
      
      <div className="flex-1 flex min-w-0 bg-white">
        <div className="w-80 flex-shrink-0 border-r border-border-subtle bg-white">
          <EntryList />
        </div>
        
        <div className="flex-1 min-w-0 bg-white p-6 overflow-y-auto">
          <DetailPanel />
        </div>
      </div>
      
      {children}
    </div>
  );
}
