import test from 'node:test';
import assert from 'node:assert/strict';
import { createVaultId, validateMasterPasswordStrength } from '../src/shared/security/masterPasswordPolicy';

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
