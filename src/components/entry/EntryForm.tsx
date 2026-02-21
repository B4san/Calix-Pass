import { useState, useEffect } from 'react';
import { Dialog } from '../common/Dialog';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { KDBXEntry, createEntry, getEntryTitle, getEntryUsername, getEntryPassword, getEntryUrl, getEntryNotes } from '../../core/model/database';

interface EntryFormProps {
  open: boolean;
  entry?: KDBXEntry | null;
  groupUuid: string;
  onSave: (entry: KDBXEntry) => void;
  onClose: () => void;
  onOpenGenerator: () => void;
  generatedPassword?: string | null;
  onPasswordUsed?: () => void;
}

export function EntryForm({ open, entry, groupUuid, onSave, onClose, onOpenGenerator, generatedPassword, onPasswordUsed }: EntryFormProps) {
  const [title, setTitle] = useState(entry ? getEntryTitle(entry) : '');
  const [username, setUsername] = useState(entry ? getEntryUsername(entry) : '');
  const [password, setPassword] = useState(entry ? getEntryPassword(entry) : '');
  const [url, setUrl] = useState(entry ? getEntryUrl(entry) : '');
  const [notes, setNotes] = useState(entry ? getEntryNotes(entry) : '');
  
  useEffect(() => {
    if (generatedPassword) {
      setPassword(generatedPassword);
      onPasswordUsed?.();
    }
  }, [generatedPassword, onPasswordUsed]);
  
  useEffect(() => {
    if (open) {
      setTitle(entry ? getEntryTitle(entry) : '');
      setUsername(entry ? getEntryUsername(entry) : '');
      setPassword(entry ? getEntryPassword(entry) : '');
      setUrl(entry ? getEntryUrl(entry) : '');
      setNotes(entry ? getEntryNotes(entry) : '');
    }
  }, [open, entry]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newEntry: KDBXEntry = entry ? {
      ...entry,
      fields: {
        ...entry.fields,
        Title: { value: title, protected: false },
        UserName: { value: username, protected: false },
        Password: { value: password, protected: true },
        URL: { value: url, protected: false },
        Notes: { value: notes, protected: false },
      },
      lastModificationTime: new Date(),
    } : {
      ...createEntry(title, username, password, url),
      fields: {
        Title: { value: title, protected: false },
        UserName: { value: username, protected: false },
        Password: { value: password, protected: true },
        URL: { value: url, protected: false },
        Notes: { value: notes, protected: false },
      },
    };
    
    onSave(newEntry);
    onClose();
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      title={entry ? 'Edit Entry' : 'New Entry'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Entry name"
          required
          autoFocus
        />
        
        <Input
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Email or username"
        />
        
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
            Password
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="flex-1 px-3 py-2 bg-[var(--control-bg)] border border-[var(--control-border)] rounded-[var(--radius-md)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
            />
            <Button type="button" variant="secondary" onClick={onOpenGenerator}>
              Generate
            </Button>
          </div>
        </div>
        
        <Input
          label="Website"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
        />
        
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes..."
            rows={3}
            className="w-full px-3 py-2 bg-[var(--control-bg)] border border-[var(--control-border)] rounded-[var(--radius-md)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] resize-none"
          />
        </div>
        
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            {entry ? 'Save Changes' : 'Create Entry'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
