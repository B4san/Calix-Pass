import { randomUUID } from 'crypto';

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateMasterPasswordStrength(password: string): PasswordValidationResult {
  if (typeof password !== 'string') {
    return {
      valid: false,
      errors: ['Master password must be a text value.'],
    };
  }

  const errors: string[] = [];
  if (password.length < 12) {
    errors.push('Master password must contain at least 12 characters.');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Master password must include at least one uppercase letter.');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Master password must include at least one lowercase letter.');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Master password must include at least one number.');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Master password must include at least one special character.');
  }

  return { valid: errors.length === 0, errors };
}

export function createVaultId(): string {
  return randomUUID();
}
