import type { KDBXEntry, KDBXField } from '../../core/model/database';

export type EntryType = 'password' | 'ssh-key' | 'payment-card' | 'secure-note' | 'identity';

export interface EntryTypeField {
  key: string;
  label: string;
  placeholder: string;
  protected: boolean;
  inputType?: 'text' | 'password' | 'textarea';
}

export interface EntryTypeDefinition {
  id: EntryType;
  label: string;
  description: string;
  fields: EntryTypeField[];
}

export const ENTRY_TYPE_DEFINITIONS: EntryTypeDefinition[] = [
  {
    id: 'password',
    label: 'Password',
    description: 'Website/app login credentials',
    fields: [
      { key: 'UserName', label: 'Username', placeholder: 'Email or username', protected: false },
      { key: 'Password', label: 'Password', placeholder: 'Password', protected: true, inputType: 'password' },
      { key: 'URL', label: 'Website', placeholder: 'https://example.com', protected: false },
    ],
  },
  {
    id: 'ssh-key',
    label: 'SSH Key',
    description: 'Server/infra SSH access',
    fields: [
      { key: 'Host', label: 'Host', placeholder: 'ssh.example.com', protected: false },
      { key: 'UserName', label: 'Username', placeholder: 'root', protected: false },
      { key: 'PrivateKey', label: 'Private Key', placeholder: 'Paste private key', protected: true, inputType: 'textarea' },
      { key: 'Passphrase', label: 'Passphrase', placeholder: 'Optional passphrase', protected: true, inputType: 'password' },
    ],
  },
  {
    id: 'payment-card',
    label: 'Payment Card',
    description: 'Card details and billing info',
    fields: [
      { key: 'CardholderName', label: 'Cardholder Name', placeholder: 'Full name', protected: false },
      { key: 'CardNumber', label: 'Card Number', placeholder: '1234 5678 9012 3456', protected: true },
      { key: 'ExpiryDate', label: 'Expiry Date', placeholder: 'MM/YY', protected: false },
      { key: 'CVV', label: 'CVV', placeholder: '123', protected: true, inputType: 'password' },
      { key: 'BillingAddress', label: 'Billing Address', placeholder: 'Optional billing address', protected: false, inputType: 'textarea' },
    ],
  },
  {
    id: 'secure-note',
    label: 'Secure Note',
    description: 'Encrypted free-form note',
    fields: [],
  },
  {
    id: 'identity',
    label: 'Identity',
    description: 'Personal identity profile',
    fields: [
      { key: 'FullName', label: 'Full Name', placeholder: 'Jane Doe', protected: false },
      { key: 'Email', label: 'Email', placeholder: 'jane@example.com', protected: false },
      { key: 'Phone', label: 'Phone', placeholder: '+1 555 555 5555', protected: false },
      { key: 'Address', label: 'Address', placeholder: 'Address', protected: false, inputType: 'textarea' },
      { key: 'NationalId', label: 'National ID', placeholder: 'Optional', protected: true },
    ],
  },
];

const ENTRY_TYPE_IDS = new Set(ENTRY_TYPE_DEFINITIONS.map((item) => item.id));

export function getEntryTypeDefinition(entryType: EntryType): EntryTypeDefinition {
  return ENTRY_TYPE_DEFINITIONS.find((item) => item.id === entryType) || ENTRY_TYPE_DEFINITIONS[0];
}

export function detectEntryType(entry?: KDBXEntry | null): EntryType {
  const raw = entry?.fields['EntryType']?.value;
  if (raw && ENTRY_TYPE_IDS.has(raw as EntryType)) {
    return raw as EntryType;
  }

  if (!entry) return 'password';
  if (entry.fields['PrivateKey']) return 'ssh-key';
  if (entry.fields['CardNumber']) return 'payment-card';
  if (entry.fields['FullName'] || entry.fields['NationalId']) return 'identity';
  if (!entry.fields['Password'] && !entry.fields['UserName'] && !entry.fields['URL']) return 'secure-note';
  return 'password';
}

export function initializeFieldsForType(entryType: EntryType, entry?: KDBXEntry | null): Record<string, string> {
  const definition = getEntryTypeDefinition(entryType);
  const result: Record<string, string> = {};
  for (const field of definition.fields) {
    result[field.key] = entry?.fields[field.key]?.value || '';
  }
  return result;
}

export function buildEntryFields(
  title: string,
  entryType: EntryType,
  dynamicValues: Record<string, string>,
  notes: string
): Record<string, KDBXField> {
  const definition = getEntryTypeDefinition(entryType);
  const fields: Record<string, KDBXField> = {
    Title: { value: title, protected: false },
    Notes: { value: notes, protected: false },
    EntryType: { value: entryType, protected: false },
  };

  for (const field of definition.fields) {
    fields[field.key] = {
      value: dynamicValues[field.key] || '',
      protected: field.protected,
    };
  }

  return fields;
}
