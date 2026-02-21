import { streamXOR } from '@stablelib/chacha';

export type InnerStreamType = 'none' | 'salsa20' | 'chaCha20' | 'invalid';

const INNER_STREAM_NONE = 0;
const INNER_STREAM_SALSA_20 = 2;
const INNER_STREAM_CHACHA_20 = 3;

export function innerStreamTypeFromId(id: number): InnerStreamType {
  switch (id) {
    case INNER_STREAM_NONE: return 'none';
    case INNER_STREAM_SALSA_20: return 'salsa20';
    case INNER_STREAM_CHACHA_20: return 'chaCha20';
    default: return 'invalid';
  }
}

export function innerStreamIdFromType(type: InnerStreamType): number {
  switch (type) {
    case 'none': return INNER_STREAM_NONE;
    case 'salsa20': return INNER_STREAM_SALSA_20;
    case 'chaCha20': return INNER_STREAM_CHACHA_20;
    default: return INNER_STREAM_NONE;
  }
}

export class InnerStreamCipher {
  private key: Uint8Array | null = null;
  private type: InnerStreamType;

  constructor(type: InnerStreamType, key: Uint8Array) {
    this.type = type;
    if (type === 'chaCha20') this.key = key;
  }

  process(data: Uint8Array): Uint8Array {
    if (this.type === 'none' || !this.key) return data;
    const nonce = new Uint8Array(12);
    const output = new Uint8Array(data.length);
    streamXOR(this.key, nonce, data, output);
    return output;
  }
}

export function xorMask(data: Uint8Array, mask: Uint8Array): Uint8Array {
  const result = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    result[i] = data[i] ^ mask[i % mask.length];
  }
  return result;
}

export class ChaCha20InnerStream {
  private key: Uint8Array;
  private counter: number = 0;

  constructor(key: Uint8Array) {
    this.key = key;
  }

  encrypt(data: Uint8Array): Uint8Array {
    const nonce = new Uint8Array(12);
    const output = new Uint8Array(data.length);
    streamXOR(this.key, nonce, data, output);
    this.counter += data.length;
    return output;
  }

  decrypt(data: Uint8Array): Uint8Array {
    return this.encrypt(data);
  }

  reset(): void {
    this.counter = 0;
  }
}
