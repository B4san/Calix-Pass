import { useState } from 'react';
import { Dialog } from '../common/Dialog';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface UnlockDialogProps {
  open: boolean;
  vaultName: string;
  onUnlock: (password: string) => Promise<void>;
  onCancel?: () => void;
  error?: string;
  loading?: boolean;
}

export function UnlockDialog({ open, vaultName, onUnlock, onCancel, error, loading }: UnlockDialogProps) {
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    
    if (!password) {
      setLocalError('Please enter your master password');
      return;
    }
    
    try {
      await onUnlock(password);
    } catch {
      setLocalError('Incorrect password');
    }
  };
  
  const displayError = localError || error;
  
  return (
    <Dialog open={open} onClose={onCancel || (() => {})} size="sm">
      <form onSubmit={handleSubmit}>
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[var(--navy-deep)] flex items-center justify-center">
            <svg className="w-7 h-7 text-[var(--amber-400)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">{vaultName}</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Enter your master password to unlock</p>
        </div>
        
        <div className="space-y-4">
          <Input
            type="password"
            label="Master Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter master password"
            error={displayError}
            autoFocus
          />
          
          <div className="flex gap-3 pt-2">
            {onCancel && (
              <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" variant="primary" className="flex-1" loading={loading}>
              Unlock
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}

interface CreateVaultDialogProps {
  open: boolean;
  onCreate: (name: string, password: string, createStarterGroups: boolean) => Promise<void>;
  onClose: () => void;
  error?: string;
  loading?: boolean;
}

export function CreateVaultDialog({ open, onCreate, onClose, error, loading }: CreateVaultDialogProps) {
  const [name, setName] = useState('My Vault');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [createStarterGroups, setCreateStarterGroups] = useState(true);
  const [localError, setLocalError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    
    if (!name.trim()) {
      setLocalError('Please enter a vault name');
      return;
    }
    
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    
    try {
      await onCreate(name.trim(), password, createStarterGroups);
    } catch {
      setLocalError('Failed to create vault');
    }
  };
  
  const displayError = localError || error;
  
  return (
    <Dialog open={open} onClose={onClose} title="Create New Vault" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Vault Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Vault"
          autoFocus
        />
        
        <Input
          type="password"
          label="Master Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a strong password"
        />
        
        <Input
          type="password"
          label="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
          error={displayError}
        />
        
        <p className="text-xs text-[var(--text-muted)]">
          This password cannot be recovered. Make sure to remember it.
        </p>

        <label className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
          <input
            type="checkbox"
            checked={createStarterGroups}
            onChange={(e) => setCreateStarterGroups(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-[var(--control-border)] text-[var(--accent)] focus:ring-[var(--accent)]"
          />
          <span>Create starter project groups (Personal, Work, Projects, Finance)</span>
        </label>
        
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1" loading={loading}>
            Create Vault
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
