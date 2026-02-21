import { randomBytes } from './random';

const PKCS7_BLOCK_SIZE = 16;

function pkcs7Pad(data: Uint8Array): Uint8Array {
  const paddingLength = PKCS7_BLOCK_SIZE - (data.length % PKCS7_BLOCK_SIZE);
  const padded = new Uint8Array(data.length + paddingLength);
  padded.set(data);
  padded.fill(paddingLength, data.length);
  return padded;
}

function pkcs7Unpad(data: Uint8Array): Uint8Array {
  if (data.length === 0) return data;
  const paddingLength = data[data.length - 1];
  if (paddingLength === 0 || paddingLength > PKCS7_BLOCK_SIZE) {
    throw new Error('Invalid PKCS7 padding');
  }
  for (let i = data.length - paddingLength; i < data.length; i++) {
    if (data[i] !== paddingLength) throw new Error('Invalid PKCS7 padding');
  }
  return data.slice(0, data.length - paddingLength);
}

export interface EncryptResult {
  ciphertext: Uint8Array;
  iv: Uint8Array;
}

export async function encryptAES256CBC(
  plaintext: Uint8Array,
  key: Uint8Array,
  providedIv?: Uint8Array
): Promise<EncryptResult> {
  if (key.length !== 32) throw new Error('Key must be 32 bytes for AES-256');
  const iv = providedIv ?? randomBytes(16);
  const padded = pkcs7Pad(plaintext);
  const cryptoKey = await crypto.subtle.importKey('raw', key.buffer as ArrayBuffer, { name: 'AES-CBC' }, false, ['encrypt']);
  const ciphertextBuffer = await crypto.subtle.encrypt({ name: 'AES-CBC', iv: iv.buffer as ArrayBuffer }, cryptoKey, padded.buffer as ArrayBuffer);
  return { ciphertext: new Uint8Array(ciphertextBuffer), iv };
}

export async function decryptAES256CBC(
  ciphertext: Uint8Array,
  key: Uint8Array,
  iv: Uint8Array
): Promise<Uint8Array> {
  if (key.length !== 32) throw new Error('Key must be 32 bytes for AES-256');
  const cryptoKey = await crypto.subtle.importKey('raw', key.buffer as ArrayBuffer, { name: 'AES-CBC' }, false, ['decrypt']);
  const decryptedBuffer = await crypto.subtle.decrypt({ name: 'AES-CBC', iv: iv.buffer as ArrayBuffer }, cryptoKey, ciphertext.buffer as ArrayBuffer);
  return pkcs7Unpad(new Uint8Array(decryptedBuffer));
}
