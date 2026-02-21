import { useState, useEffect } from 'react';
import { Dialog } from '../common/Dialog';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { KDBXEntry, createEntry, getEntryNotes, getEntryTitle } from '../../core/model/database';
import {
  ENTRY_TYPE_DEFINITIONS,
  buildEntryFields,
  detectEntryType,
  getEntryTypeDefinition,
  initializeFieldsForType,
  type EntryType,
} from './entryTypes';

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

export function EntryForm({
  open,
  entry,
  groupUuid: _groupUuid,
  onSave,
  onClose,
  onOpenGenerator,
  generatedPassword,
  onPasswordUsed,
}: EntryFormProps) {
  const [title, setTitle] = useState(entry ? getEntryTitle(entry) : '');
  const [entryType, setEntryType] = useState<EntryType>(detectEntryType(entry));
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(initializeFieldsForType(detectEntryType(entry), entry));
  const [notes, setNotes] = useState(entry ? getEntryNotes(entry) : '');

  useEffect(() => {
    if (generatedPassword) {
      setFieldValues((prev) => ({
        ...prev,
        Password: generatedPassword,
      }));
      onPasswordUsed?.();
    }
  }, [generatedPassword, onPasswordUsed]);

  useEffect(() => {
    if (open) {
      const detectedType = detectEntryType(entry);
      setEntryType(detectedType);
      setTitle(entry ? getEntryTitle(entry) : '');
      setFieldValues(initializeFieldsForType(detectedType, entry));
      setNotes(entry ? getEntryNotes(entry) : '');
    }
  }, [open, entry]);

  const definition = getEntryTypeDefinition(entryType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const fields = buildEntryFields(title, entryType, fieldValues, notes);
    const newEntry: KDBXEntry = entry
      ? {
          ...entry,
          fields: {
            ...entry.fields,
            ...fields,
          },
          lastModificationTime: new Date(),
        }
      : {
          ...createEntry(title),
          fields,
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

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#243148]">Type</label>
          <select
            value={entryType}
            onChange={(e) => {
              const nextType = e.target.value as EntryType;
              setEntryType(nextType);
              setFieldValues(initializeFieldsForType(nextType, entry));
            }}
            className="w-full rounded-xl border border-[#d9e0ef] bg-white px-4 py-2 text-[#1f2a3d] outline-none focus:border-[#2756f6] focus:ring-2 focus:ring-[#2756f6]/20"
          >
            {ENTRY_TYPE_DEFINITIONS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label} - {item.description}
              </option>
            ))}
          </select>
        </div>

        {definition.fields.map((field) => (
          <div key={field.key}>
            {field.inputType === 'textarea' ? (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#243148]">{field.label}</label>
                <textarea
                  value={fieldValues[field.key] || ''}
                  onChange={(e) => setFieldValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  rows={field.key === 'PrivateKey' ? 5 : 3}
                  className="w-full resize-none rounded-xl border border-[#d9e0ef] bg-white px-4 py-2 text-[#1f2a3d] outline-none focus:border-[#2756f6] focus:ring-2 focus:ring-[#2756f6]/20"
                />
              </div>
            ) : (
              <div>
                <Input
                  label={field.label}
                  type={field.inputType === 'password' ? 'password' : 'text'}
                  value={fieldValues[field.key] || ''}
                  onChange={(e) => setFieldValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  showPasswordToggle={field.protected}
                />
                {field.key === 'Password' && (
                  <Button type="button" variant="secondary" size="sm" className="mt-2 !rounded-xl" onClick={onOpenGenerator}>
                    Generate Password
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#243148]">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes..."
            rows={3}
            className="w-full resize-none rounded-xl border border-[#d9e0ef] bg-white px-4 py-2 text-[#1f2a3d] outline-none focus:border-[#2756f6] focus:ring-2 focus:ring-[#2756f6]/20"
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
