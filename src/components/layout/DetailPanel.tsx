import React from 'react';
import { useVaultStore } from '../../stores/vaultStore';
import { useUIStore } from '../../stores/uiStore';
import { useClipboard } from '../../hooks/useClipboard';
import {
  findEntryByUuid,
  findParentGroup,
  getEntryTitle,
  getEntryUsername,
  getEntryPassword,
  getEntryUrl,
  getEntryNotes,
} from '../../core/model/database';
import { Button } from '../common/Button';
import { Dropdown, DropdownItem, DropdownDivider } from '../common/Dropdown';

export function DetailPanel() {
  const { database, restoreEntry, permanentlyDeleteEntry } = useVaultStore();
  const {
    selectedEntryUuid,
    setSelectedEntry,
    setShowEditDialog,
    setShowDeleteConfirm,
    setShowPasswordGenerator,
    addToast,
  } = useUIStore();
  const { copy } = useClipboard();
  
  if (!database || !selectedEntryUuid) {
    return (
      <div className="h-full flex items-center justify-center bg-[var(--surface-base)]">
        <div className="text-center px-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--surface-inset)] flex items-center justify-center">
            <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <p className="text-[var(--text-secondary)] text-sm">
            Select an entry to view details
          </p>
        </div>
      </div>
    );
  }
  
  const entry = findEntryByUuid(database.rootGroup, selectedEntryUuid);
  
  if (!entry) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-[var(--text-muted)]">Entry not found</p>
      </div>
    );
  }
  
  const title = getEntryTitle(entry);
  const parentGroup = findParentGroup(database.rootGroup, entry.uuid);
  const isInRecycleBin = !!database.meta.recycleBinUuid && parentGroup?.uuid === database.meta.recycleBinUuid;
  const username = getEntryUsername(entry);
  const password = getEntryPassword(entry);
  const url = getEntryUrl(entry);
  const notes = getEntryNotes(entry);
  
  const standardFields = [
    { key: 'UserName', label: 'Username', value: username, protected: false },
    { key: 'Password', label: 'Password', value: password, protected: true },
    { key: 'URL', label: 'Website', value: url, protected: false },
  ];
  
  const customFields = Object.entries(entry.fields)
    .filter(([key]) => !['Title', 'UserName', 'Password', 'URL', 'Notes'].includes(key));
  
  return (
    <div className="h-full flex flex-col bg-[var(--surface-base)]">
      <div className="px-6 py-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] truncate">
              {title}
            </h2>
            {username && (
              <p className="text-sm text-[var(--text-secondary)] truncate mt-0.5">
                {username}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="secondary" size="sm" onClick={() => setShowEditDialog(true)}>
              Edit
            </Button>
            <Dropdown
              trigger={
                <button className="p-2 rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:bg-[var(--border-subtle)] transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              }
              align="end"
            >
              {(close) => (
                <>
                  {isInRecycleBin ? (
                    <>
                      <DropdownItem
                        onClick={() => {
                          restoreEntry(entry.uuid);
                          addToast('Entry restored', 'success');
                          close();
                        }}
                      >
                        Restore Entry
                      </DropdownItem>
                      <DropdownItem
                        danger
                        onClick={() => {
                          if (confirm('Permanently delete this entry? This cannot be undone.')) {
                            permanentlyDeleteEntry(entry.uuid);
                            setSelectedEntry(null);
                            addToast('Entry permanently deleted', 'success');
                          }
                          close();
                        }}
                      >
                        Delete Permanently
                      </DropdownItem>
                    </>
                  ) : (
                    <>
                      <DropdownItem onClick={() => { setShowPasswordGenerator(true); close(); }}>
                        Generate Password
                      </DropdownItem>
                      <DropdownDivider />
                      <DropdownItem onClick={close}>
                        View History
                      </DropdownItem>
                      <DropdownItem danger onClick={() => { setShowDeleteConfirm(true); close(); }}>
                        Delete Entry
                      </DropdownItem>
                    </>
                  )}
                </>
              )}
            </Dropdown>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-4">
          {standardFields.map(({ key, label, value, protected: isProtected }) => (
            value && (
              <FieldRow
                key={key}
                label={label}
                value={value}
                isProtected={isProtected}
                onCopy={() => copy(value, label)}
              />
            )
          ))}
          
          {customFields.length > 0 && (
            <div className="pt-4 border-t border-[var(--border-subtle)]">
              <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">
                Custom Fields
              </h3>
              {customFields.map(([key, field]) => (
                <FieldRow
                  key={key}
                  label={key}
                  value={field.value}
                  isProtected={field.protected}
                  onCopy={() => copy(field.value, key)}
                />
              ))}
            </div>
          )}
          
          {notes && (
            <div className="pt-4 border-t border-[var(--border-subtle)]">
              <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
                Notes
              </h3>
              <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap bg-[var(--surface-inset)] rounded-[var(--radius-md)] p-3">
                {notes}
              </p>
            </div>
          )}
          
          {entry.tags.length > 0 && (
            <div className="pt-4 border-t border-[var(--border-subtle)]">
              <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
                Tags
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-[var(--border-subtle)] text-[var(--text-secondary)] rounded-[var(--radius-sm)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface FieldRowProps {
  label: string;
  value: string;
  isProtected: boolean;
  onCopy: () => void;
}

function FieldRow({ label, value, isProtected, onCopy }: FieldRowProps) {
  const [showProtected, setShowProtected] = React.useState(false);
  
  return (
  <div className="group">
    <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
      {label}
    </label>
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-[var(--surface-inset)] rounded-[var(--radius-md)] px-3 py-2 font-mono text-sm text-[var(--text-primary)] min-w-0">
        <span className={isProtected && !showProtected ? 'select-none' : ''}>
          {isProtected && !showProtected ? '••••••••••••' : value}
        </span>
      </div>
      {isProtected && (
        <button
          onClick={() => setShowProtected(!showProtected)}
          className="p-2 rounded-[var(--radius-md)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--border-subtle)] transition-colors"
        >
          {showProtected ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      )}
      <button
        onClick={onCopy}
        className="p-2 rounded-[var(--radius-md)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--border-subtle)] transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>
      {label === 'Website' && value && (
        <a
          href={value.startsWith('http') ? value : `https://${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-[var(--radius-md)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--border-subtle)] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )}
    </div>
  </div>
  );
}
