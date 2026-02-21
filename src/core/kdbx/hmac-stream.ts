import { sha256 } from '../crypto/hash';

const HMAC_BLOCK_SIZE = 64;

async function hmacBlockKey(hmacKey: Uint8Array, blockIndex: bigint): Promise<Uint8Array> {
  const indexBytes = new Uint8Array(8);
  for (let i = 0; i < 8; i++) {
    indexBytes[i] = Number((blockIndex >> BigInt(i * 8)) & BigInt(0xff));
  }
  
  const keyData = new Uint8Array(hmacKey.length + 8);
  keyData.set(hmacKey, 0);
  keyData.set(indexBytes, hmacKey.length);
  
  return await sha256(keyData);
}

export async function createHmacBlockStream(
  data: Uint8Array,
  hmacKey: Uint8Array,
  blockSize: number = 1024 * 1024
): Promise<Uint8Array> {
  const numBlocks = Math.ceil(data.length / blockSize);
  const blocks: Uint8Array[] = [];
  
  for (let i = 0; i < numBlocks; i++) {
    const start = i * blockSize;
    const end = Math.min(start + blockSize, data.length);
    const blockData = data.slice(start, end);
    
    const blockKey = await hmacBlockKey(hmacKey, BigInt(i));
    const hmac = await computeHmacSha256(blockData, blockKey);
    
    const blockWithHmac = new Uint8Array(32 + blockData.length);
    blockWithHmac.set(hmac, 0);
    blockWithHmac.set(blockData, 32);
    blocks.push(blockWithHmac);
  }
  
  const totalLen = blocks.reduce((sum, b) => sum + b.length, 0);
  const result = new Uint8Array(totalLen);
  let offset = 0;
  for (const block of blocks) {
    result.set(block, offset);
    offset += block.length;
  }
  return result;
}

export async function verifyHmacBlockStream(
  data: Uint8Array,
  hmacKey: Uint8Array,
  blockSize: number = 1024 * 1024
): Promise<Uint8Array> {
  let offset = 0;
  const chunks: Uint8Array[] = [];
  
  for (let blockIndex = 0; offset < data.length; blockIndex++) {
    if (offset + 32 > data.length) {
      throw new Error('Invalid HMAC block stream: truncated block');
    }
    
    const storedHmac = data.slice(offset, offset + 32);
    offset += 32;
    
    let blockEnd = offset + blockSize;
    if (blockEnd > data.length) {
      blockEnd = data.length;
    }
    
    const blockData = data.slice(offset, blockEnd);
    offset = blockEnd;
    
    const blockKey = await hmacBlockKey(hmacKey, BigInt(blockIndex));
    const computedHmac = await computeHmacSha256(blockData, blockKey);
    
    if (!timingSafeEqual(storedHmac, computedHmac)) {
      throw new Error('HMAC verification failed');
    }
    
    chunks.push(blockData);
  }
  
  const totalLen = chunks.reduce((sum, c) => sum + c.length, 0);
  const result = new Uint8Array(totalLen);
  let resultOffset = 0;
  for (const chunk of chunks) {
    result.set(chunk, resultOffset);
    resultOffset += chunk.length;
  }
  return result;
}

async function computeHmacSha256(data: Uint8Array, key: Uint8Array): Promise<Uint8Array> {
  const keyCopy = new Uint8Array(key);
  const dataCopy = new Uint8Array(data);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyCopy.buffer as ArrayBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataCopy.buffer as ArrayBuffer);
  return new Uint8Array(signature);
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}
