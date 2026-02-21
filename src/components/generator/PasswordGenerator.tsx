import { useState } from 'react';
import { generatePassword, calculateEntropy, getCharsetSize, type PasswordOptions } from '../../core/generator/password';
import { generatePassphrase } from '../../core/generator/passphrase';
import { Button } from '../common/Button';
import { Dialog } from '../common/Dialog';
import { useClipboard } from '../../hooks/useClipboard';

interface PasswordGeneratorProps {
  open: boolean;
  onClose: () => void;
  onSelect?: (password: string) => void;
}

type GeneratorMode = 'password' | 'passphrase';

export function PasswordGenerator({ open, onClose, onSelect }: PasswordGeneratorProps) {
  const [mode, setMode] = useState<GeneratorMode>('password');
  const [generated, setGenerated] = useState('');
  const { copy } = useClipboard();
  
  const [passwordOptions, setPasswordOptions] = useState<PasswordOptions>({
    length: 20,
    uppercase: true,
    lowercase: true,
    digits: true,
    symbols: true,
    latinExtended: false,
    brackets: false,
    punctuation: false,
    excludeAmbiguous: false,
  });
  
  const [passphraseOptions, setPassphraseOptions] = useState({
    wordCount: 5,
    separator: '-',
    capitalize: false,
  });
  
  const generate = () => {
    if (mode === 'password') {
      setGenerated(generatePassword(passwordOptions));
    } else {
      setGenerated(generatePassphrase(passphraseOptions));
    }
  };
  
  const entropy = mode === 'password'
    ? calculateEntropy({
        length: passwordOptions.length,
        charsetSize: getCharsetSize(passwordOptions),
      })
    : calculateEntropy({
        length: passphraseOptions.wordCount,
        charsetSize: 1296,
      });
  
  const handleSelect = () => {
    if (generated && onSelect) {
      onSelect(generated);
      onClose();
    }
  };
  
  const charOptions = [
    { key: 'uppercase', label: 'Uppercase (A-Z)' },
    { key: 'lowercase', label: 'Lowercase (a-z)' },
    { key: 'digits', label: 'Numbers (0-9)' },
    { key: 'symbols', label: 'Symbols (!@#$)' },
    { key: 'latinExtended', label: 'Latin Extended (áéñü)' },
    { key: 'brackets', label: 'Brackets ()[]{}' },
    { key: 'punctuation', label: 'Punctuation (.,;:!?)' },
  ];
  
  return (
    <Dialog open={open} onClose={onClose} title="Password Generator" size="md">
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => { setMode('password'); setGenerated(''); }}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-[var(--radius-md)] transition-colors ${
              mode === 'password'
                ? 'bg-[var(--accent)] text-[var(--navy-deep)]'
                : 'bg-[var(--surface-inset)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Password
          </button>
          <button
            onClick={() => { setMode('passphrase'); setGenerated(''); }}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-[var(--radius-md)] transition-colors ${
              mode === 'passphrase'
                ? 'bg-[var(--accent)] text-[var(--navy-deep)]'
                : 'bg-[var(--surface-inset)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Passphrase
          </button>
        </div>
        
        {mode === 'password' ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1.5">
                Length: {passwordOptions.length}
              </label>
              <input
                type="range"
                min="8"
                max="64"
                value={passwordOptions.length}
                onChange={(e) => setPasswordOptions({ ...passwordOptions, length: parseInt(e.target.value) })}
                className="w-full accent-[var(--accent)]"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {charOptions.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={passwordOptions[key as keyof PasswordOptions] as boolean}
                    onChange={(e) => setPasswordOptions({ ...passwordOptions, [key]: e.target.checked })}
                    className="w-4 h-4 rounded border-[var(--border-default)] accent-[var(--accent)]"
                  />
                  <span className="text-sm text-[var(--text-secondary)]">{label}</span>
                </label>
              ))}
            </div>
            
            <label className="flex items-center gap-2 cursor-pointer pt-1 border-t border-[var(--border-subtle)]">
              <input
                type="checkbox"
                checked={passwordOptions.excludeAmbiguous}
                onChange={(e) => setPasswordOptions({ ...passwordOptions, excludeAmbiguous: e.target.checked })}
                className="w-4 h-4 rounded border-[var(--border-default)] accent-[var(--accent)]"
              />
              <span className="text-sm text-[var(--text-secondary)]">Exclude ambiguous (0O1lI)</span>
            </label>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1.5">
                Words: {passphraseOptions.wordCount}
              </label>
              <input
                type="range"
                min="3"
                max="10"
                value={passphraseOptions.wordCount}
                onChange={(e) => setPassphraseOptions({ ...passphraseOptions, wordCount: parseInt(e.target.value) })}
                className="w-full accent-[var(--accent)]"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={passphraseOptions.capitalize}
                  onChange={(e) => setPassphraseOptions({ ...passphraseOptions, capitalize: e.target.checked })}
                  className="w-4 h-4 rounded border-[var(--border-default)] accent-[var(--accent)]"
                />
                <span className="text-sm text-[var(--text-secondary)]">Capitalize</span>
              </label>
              
              <div className="flex items-center gap-2">
                <label className="text-sm text-[var(--text-secondary)]">Separator:</label>
                <select
                  value={passphraseOptions.separator}
                  onChange={(e) => setPassphraseOptions({ ...passphraseOptions, separator: e.target.value })}
                  className="flex-1 px-2 py-1 text-sm bg-[var(--control-bg)] border border-[var(--control-border)] rounded-[var(--radius-md)] focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="-">Hyphen (-)</option>
                  <option value=" ">Space ( )</option>
                  <option value="_">Underscore (_)</option>
                  <option value=".">Dot (.)</option>
                  <option value="">None</option>
                </select>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-[var(--surface-inset)] rounded-[var(--radius-lg)] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--text-muted)]">Entropy</span>
            <span className={`text-xs font-medium ${getEntropyColor(entropy)}`}>
              {entropy.toFixed(1)} bits
            </span>
          </div>
          <div className="h-1.5 bg-[var(--border-default)] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${getEntropyBgColor(entropy)}`}
              style={{ width: `${Math.min(100, (entropy / 128) * 100)}%` }}
            />
          </div>
        </div>
        
        {generated && (
          <div className="bg-[var(--surface-inset)] rounded-[var(--radius-md)] p-3">
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm font-mono text-[var(--text-primary)] break-all">
                {generated}
              </code>
              <button
                onClick={() => copy(generated, 'Password')}
                className="p-2 rounded-[var(--radius-md)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--border-subtle)] transition-colors flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={generate}>
            Generate
          </Button>
          {onSelect && (
            <Button variant="primary" className="flex-1" onClick={handleSelect} disabled={!generated}>
              Use Password
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
}

function getEntropyColor(entropy: number): string {
  if (entropy < 40) return 'text-[var(--error)]';
  if (entropy < 60) return 'text-[var(--warning)]';
  if (entropy < 80) return 'text-[var(--accent)]';
  return 'text-[var(--success)]';
}

function getEntropyBgColor(entropy: number): string {
  if (entropy < 40) return 'bg-[var(--error)]';
  if (entropy < 60) return 'bg-[var(--warning)]';
  if (entropy < 80) return 'bg-[var(--accent)]';
  return 'bg-[var(--success)]';
}
