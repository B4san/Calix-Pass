import { randomBytes } from '../crypto/random';

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*';
const LATIN_EXTENDED = 'áéíóúñüàèìòùâêîôûäëïöüÿãõåæœçðøþ';
const BRACKETS = '()[]{}<>';
const PUNCTUATION = '.,;:!?';

export interface PasswordOptions {
  length: number;
  uppercase?: boolean;
  lowercase?: boolean;
  digits?: boolean;
  symbols?: boolean;
  latinExtended?: boolean;
  brackets?: boolean;
  punctuation?: boolean;
  excludeChars?: string;
  excludeAmbiguous?: boolean;
}

const AMBIGUOUS = '0O1lI|';

export function generatePassword(options: PasswordOptions): string {
  const { 
    length, 
    uppercase = true, 
    lowercase = true, 
    digits = true, 
    symbols = true,
    latinExtended = false,
    brackets = false,
    punctuation = false,
    excludeChars = '',
    excludeAmbiguous = false,
  } = options;
  
  let charset = '';
  if (uppercase) charset += UPPERCASE;
  if (lowercase) charset += LOWERCASE;
  if (digits) charset += DIGITS;
  if (symbols) charset += SYMBOLS;
  if (latinExtended) charset += LATIN_EXTENDED;
  if (brackets) charset += BRACKETS;
  if (punctuation) charset += PUNCTUATION;
  
  if (charset.length === 0) throw new Error('At least one character set must be enabled');
  
  if (excludeAmbiguous) {
    const ambiguousSet = new Set(AMBIGUOUS.split(''));
    charset = charset.split('').filter(c => !ambiguousSet.has(c)).join('');
  }
  
  if (excludeChars) {
    const excludeSet = new Set(excludeChars.split(''));
    charset = charset.split('').filter(c => !excludeSet.has(c)).join('');
  }
  
  const random = randomBytes(length);
  let password = '';
  for (let i = 0; i < length; i++) password += charset[random[i] % charset.length];
  return password;
}

export interface EntropyOptions { length: number; charsetSize: number; }

export function calculateEntropy(options: EntropyOptions): number {
  const { length, charsetSize } = options;
  if (charsetSize <= 0 || length <= 0) return 0;
  return length * Math.log2(charsetSize);
}

export function getCharsetSize(options: PasswordOptions): number {
  let size = 0;
  if (options.uppercase) size += 26;
  if (options.lowercase) size += 26;
  if (options.digits) size += 10;
  if (options.symbols) size += 8;
  if (options.latinExtended) size += LATIN_EXTENDED.length;
  if (options.brackets) size += BRACKETS.length;
  if (options.punctuation) size += PUNCTUATION.length;
  return size || 1;
}
