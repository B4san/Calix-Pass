import { inflateSync, deflateSync } from 'fflate';
import { parseHeader, serializeHeader, KDBXHeader, COMPRESSION_GZIP } from './header';
import { verifyHmacBlockStream, createHmacBlockStream } from './hmac-stream';
import { sha256, sha512 } from '../crypto/hash';
import { deriveKeyArgon2id } from '../crypto/argon2';
import { decryptAES256CBC, encryptAES256CBC } from '../crypto/aes256';
import { parseXML, serializeXML } from './xml';
import { Database, KDBXEntry, KDBXGroup } from '../model/database';
import { randomBytes } from '../crypto/random';
import { ChaCha20InnerStream } from '../crypto/inner-stream';

export type { KDBXHeader };

export async function parseKDBX(
  data: Uint8Array,
  password: string
): Promise<{ database: Database; header: KDBXHeader }> {
  const { header, offset: headerEnd } = parseHeader(data);
  
  const masterKey = await deriveCompositeKey(header, password);
  const hmacKey = await deriveHmacKey(header, masterKey);
  
  const hmacBlockOffset = headerEnd + 32;
  const encryptedData = data.slice(hmacBlockOffset);
  
  const decryptedData = await verifyHmacBlockStream(encryptedData, hmacKey);
  
  const storedHmac = data.slice(headerEnd, headerEnd + 32);
  const computedHmac = await computeHeaderHmac(data.slice(0, headerEnd), hmacKey);
  
  if (!timingSafeEqual(storedHmac, computedHmac)) {
    throw new Error('Invalid password or corrupted file');
  }
  
  let xmlData = decryptedData;
  if (header.compression === COMPRESSION_GZIP) {
    xmlData = inflateSync(decryptedData);
  }
  
  const innerStream = new ChaCha20InnerStream(header.innerStreamKey);
  const database = parseXML(xmlData, innerStream);
  
  return { database, header };
}

export async function serializeKDBX(
  database: Database,
  header: KDBXHeader,
  password: string
): Promise<Uint8Array> {
  const masterKey = await deriveCompositeKey(header, password);
  const hmacKey = await deriveHmacKey(header, masterKey);
  
  const innerStream = new ChaCha20InnerStream(header.innerStreamKey);
  let xmlData = serializeXML(database, innerStream);
  
  if (header.compression === COMPRESSION_GZIP) {
    xmlData = deflateSync(xmlData);
  }
  
  const encryptedStream = await createHmacBlockStream(xmlData, hmacKey);
  
  const headerBytes = serializeHeader(header);
  const headerHmac = await computeHeaderHmac(headerBytes, hmacKey);
  
  const result = new Uint8Array(headerBytes.length + 32 + encryptedStream.length);
  result.set(headerBytes, 0);
  result.set(headerHmac, headerBytes.length);
  result.set(encryptedStream, headerBytes.length + 32);
  
  return result;
}

export function createDefaultHeader(): KDBXHeader {
  return {
    versionMajor: 4,
    versionMinor: 1,
    masterSeed: randomBytes(32),
    encryptionIV: randomBytes(16),
    transformSeed: randomBytes(32),
    transformRounds: BigInt(2),
    innerStreamKey: randomBytes(32),
    streamStartBytes: randomBytes(32),
    compression: COMPRESSION_GZIP,
  };
}

async function deriveCompositeKey(header: KDBXHeader, password: string): Promise<Uint8Array> {
  const passwordBytes = new TextEncoder().encode(password);
  const passwordHash = await sha256(passwordBytes);
  
  const compositeKey = await deriveKeyArgon2id({
    password: passwordHash,
    salt: header.transformSeed,
    memory: 65536,
    iterations: Number(header.transformRounds),
    parallelism: 2,
    hashLength: 32,
  });
  
  return sha256(compositeKey);
}

async function deriveHmacKey(header: KDBXHeader, compositeKey: Uint8Array): Promise<Uint8Array> {
  const keyData = new Uint8Array(header.masterSeed.length + compositeKey.length + 1);
  keyData.set(header.masterSeed, 0);
  keyData.set(compositeKey, header.masterSeed.length);
  keyData[keyData.length - 1] = 1;
  
  return sha512(keyData);
}

async function computeHeaderHmac(headerData: Uint8Array, hmacKey: Uint8Array): Promise<Uint8Array> {
  const blockKey = await sha256(new Uint8Array([...hmacKey, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]));
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    blockKey.buffer as ArrayBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, headerData.buffer as ArrayBuffer);
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
