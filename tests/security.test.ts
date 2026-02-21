import test from 'node:test';
import assert from 'node:assert/strict';
import { createVaultId, validateMasterPasswordStrength } from '../src/shared/security/masterPasswordPolicy';
import { filterVaultsByView, normalizeTags, createDefaultVaultPickerPrefs } from '../src/components/vault/vaultPickerUtils';
import { buildEntryFields, detectEntryType } from '../src/components/entry/entryTypes';

test('accepts strong master password', () => {
  const result = validateMasterPasswordStrength('Strong#Pass2026');
  assert.equal(result.valid, true);
  assert.equal(result.errors.length, 0);
});

test('rejects weak password with specific messages', () => {
  const result = validateMasterPasswordStrength('weakpass');
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes('Master password must include at least one uppercase letter.'));
  assert.ok(result.errors.includes('Master password must include at least one number.'));
  assert.ok(result.errors.includes('Master password must include at least one special character.'));
});

test('rejects non-string password input', () => {
  const result = validateMasterPasswordStrength(42 as unknown as string);
  assert.equal(result.valid, false);
  assert.deepEqual(result.errors, ['Master password must be a text value.']);
});

test('createVaultId generates uuid v4 format', () => {
  const id = createVaultId();
  assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
});

test('vault filters: favorites and recent should work', () => {
  const now = new Date('2026-02-21T00:00:00.000Z');
  const vaults = [
    {
      id: 'a',
      name: 'Work',
      fileName: 'a.kdbx',
      createdAt: '2026-02-01T00:00:00.000Z',
      lastAccessedAt: '2026-02-20T00:00:00.000Z',
    },
    {
      id: 'b',
      name: 'Old',
      fileName: 'b.kdbx',
      createdAt: '2026-01-01T00:00:00.000Z',
      lastAccessedAt: '2025-12-01T00:00:00.000Z',
    },
  ];
  const prefs = createDefaultVaultPickerPrefs();
  prefs.favorites = ['b'];
  const favorites = filterVaultsByView(vaults, '', 'favorites', prefs, now);
  const recent = filterVaultsByView(vaults, '', 'recent', prefs, now);
  assert.deepEqual(favorites.map((v) => v.id), ['b']);
  assert.deepEqual(recent.map((v) => v.id), ['a']);
});

test('normalizeTags trims, removes empty values, limits size', () => {
  const tags = normalizeTags('work,  finance,,  personal,ops,infra,dev,home,bank,extra');
  assert.deepEqual(tags, ['work', 'finance', 'personal', 'ops', 'infra', 'dev', 'home', 'bank']);
});

test('buildEntryFields creates typed fields and detectEntryType reads them', () => {
  const fields = buildEntryFields(
    'Server SSH',
    'ssh-key',
    { Host: 'srv.local', UserName: 'root', PrivateKey: '---KEY---', Passphrase: 'secret' },
    'prod server'
  );
  assert.equal(fields.EntryType.value, 'ssh-key');
  assert.equal(fields.PrivateKey.protected, true);

  const entry = {
    uuid: 'x',
    fields,
    iconId: 0,
    tags: [],
    expires: false,
    usageCount: 0,
    history: [],
    binaries: {},
  };
  assert.equal(detectEntryType(entry as any), 'ssh-key');
});
