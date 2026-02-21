export const KDBX_SIGNATURE = [0x03, 0xd9, 0xa2, 0x9a];
export const KDBX_VERSION_4_0 = 0x00040000;
export const KDBX_VERSION_4_1 = 0x00040001;

export enum HeaderFieldId {
  End = 0,
  Comment = 1,
  CipherID = 2,
  CompressionFlags = 3,
  MasterSeed = 4,
  TransformSeed = 5,
  TransformRounds = 6,
  EncryptionIV = 7,
  InnerRandomStreamKey = 8,
  StreamStartBytes = 9,
  InnerRandomStreamID = 10,
  KdfParameters = 11,
  PublicCustomData = 12,
}

export const CIPHER_AES256_CBC = new Uint8Array([
  0x31, 0xc1, 0xf2, 0xe6, 0xbf, 0x71, 0x43, 0x50,
  0xbe, 0x58, 0x05, 0x21, 0x6a, 0xfc, 0x5a, 0xff,
]);

export const INNER_STREAM_CHACHA20 = new Uint8Array([
  0x56, 0x93, 0x22, 0x4a, 0x7a, 0xcd, 0xf7, 0x0b,
  0xcd, 0x45, 0x5e, 0x9d, 0x1d, 0x59, 0x25, 0x8e,
]);

export const COMPRESSION_NONE = 0;
export const COMPRESSION_GZIP = 1;

export interface KDBXHeader {
  versionMajor: number;
  versionMinor: number;
  masterSeed: Uint8Array;
  encryptionIV: Uint8Array;
  transformSeed: Uint8Array;
  transformRounds: bigint;
  innerStreamKey: Uint8Array;
  streamStartBytes: Uint8Array;
  compression: number;
}

export function parseHeader(data: Uint8Array): { header: KDBXHeader; offset: number } {
  if (data.length < 12) throw new Error('File too small for KDBX header');
  
  for (let i = 0; i < 4; i++) {
    if (data[i] !== KDBX_SIGNATURE[i]) {
      throw new Error('Invalid KDBX signature');
    }
  }
  
  const versionMajor = data[4] | (data[5] << 8);
  const versionMinor = data[6] | (data[7] << 8);
  const fileVersion = (versionMajor << 16) | versionMinor;
  
  if (fileVersion < KDBX_VERSION_4_0) {
    throw new Error('Only KDBX 4.x format is supported');
  }
  
  const header: KDBXHeader = {
    versionMajor,
    versionMinor,
    masterSeed: new Uint8Array(0),
    encryptionIV: new Uint8Array(0),
    transformSeed: new Uint8Array(0),
    transformRounds: BigInt(0),
    innerStreamKey: new Uint8Array(0),
    streamStartBytes: new Uint8Array(0),
    compression: COMPRESSION_NONE,
  };
  
  let offset = 8;
  
  while (offset < data.length) {
    const fieldId = data[offset];
    offset += 1;
    
    const fieldLen = data[offset] | (data[offset + 1] << 8) | 
                     (data[offset + 2] << 16) | (data[offset + 3] << 24);
    offset += 4;
    
    if (fieldId === HeaderFieldId.End) {
      break;
    }
    
    const fieldData = data.slice(offset, offset + fieldLen);
    offset += fieldLen;
    
    switch (fieldId) {
      case HeaderFieldId.MasterSeed:
        header.masterSeed = fieldData;
        break;
      case HeaderFieldId.EncryptionIV:
        header.encryptionIV = fieldData;
        break;
      case HeaderFieldId.TransformSeed:
        header.transformSeed = fieldData;
        break;
      case HeaderFieldId.TransformRounds:
        header.transformRounds = bytesToBigInt(fieldData);
        break;
      case HeaderFieldId.InnerRandomStreamKey:
        header.innerStreamKey = fieldData;
        break;
      case HeaderFieldId.StreamStartBytes:
        header.streamStartBytes = fieldData;
        break;
      case HeaderFieldId.CompressionFlags:
        header.compression = fieldData[0] | (fieldData[1] << 8);
        break;
      case HeaderFieldId.KdfParameters:
        const kdfParams = parseVariantDict(fieldData);
        if (kdfParams.iterations) header.transformRounds = kdfParams.iterations as bigint;
        break;
    }
  }
  
  return { header, offset };
}

function bytesToBigInt(bytes: Uint8Array): bigint {
  let result = BigInt(0);
  for (let i = bytes.length - 1; i >= 0; i--) {
    result = (result << BigInt(8)) | BigInt(bytes[i]);
  }
  return result;
}

interface VariantDict {
  [key: string]: unknown;
}

function parseVariantDict(data: Uint8Array): VariantDict {
  const result: VariantDict = {};
  let offset = 0;
  
  const version = data[offset] | (data[offset + 1] << 8);
  offset += 2;
  
  if (version > 1) return result;
  
  const numEntries = data[offset] | (data[offset + 1] << 8) | 
                     (data[offset + 2] << 16) | (data[offset + 3] << 24);
  offset += 4;
  
  for (let i = 0; i < numEntries && offset < data.length; i++) {
    const keyLen = data[offset] | (data[offset + 1] << 8);
    offset += 2;
    const key = new TextDecoder().decode(data.slice(offset, offset + keyLen));
    offset += keyLen;
    
    const valueLen = data[offset] | (data[offset + 1] << 2) | 
                     (data[offset + 2] << 16) | (data[offset + 3] << 24);
    offset += 4;
    const value = data.slice(offset, offset + valueLen);
    offset += valueLen;
    
    if (key === '$UUID') continue;
    result[key.toLowerCase()] = value;
  }
  
  return result;
}

export function serializeHeader(header: KDBXHeader): Uint8Array {
  const chunks: Uint8Array[] = [];
  
  chunks.push(new Uint8Array(KDBX_SIGNATURE));
  chunks.push(new Uint8Array([header.versionMajor & 0xff, (header.versionMajor >> 8) & 0xff]));
  chunks.push(new Uint8Array([header.versionMinor & 0xff, (header.versionMinor >> 8) & 0xff]));
  
  chunks.push(serializeField(HeaderFieldId.CipherID, CIPHER_AES256_CBC));
  chunks.push(serializeField(HeaderFieldId.CompressionFlags, new Uint8Array([header.compression, 0])));
  chunks.push(serializeField(HeaderFieldId.MasterSeed, header.masterSeed));
  chunks.push(serializeField(HeaderFieldId.EncryptionIV, header.encryptionIV));
  chunks.push(serializeField(HeaderFieldId.StreamStartBytes, header.streamStartBytes));
  chunks.push(serializeField(HeaderFieldId.InnerRandomStreamID, INNER_STREAM_CHACHA20));
  chunks.push(serializeField(HeaderFieldId.InnerRandomStreamKey, header.innerStreamKey));
  chunks.push(serializeField(HeaderFieldId.TransformSeed, header.transformSeed));
  chunks.push(serializeField(HeaderFieldId.TransformRounds, bigIntToBytes(header.transformRounds, 8)));
  chunks.push(serializeField(HeaderFieldId.End, new Uint8Array(0)));
  
  const totalLen = chunks.reduce((sum, c) => sum + c.length, 0);
  const result = new Uint8Array(totalLen);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

function serializeField(id: number, data: Uint8Array): Uint8Array {
  const result = new Uint8Array(1 + 4 + data.length);
  result[0] = id;
  result[1] = data.length & 0xff;
  result[2] = (data.length >> 8) & 0xff;
  result[3] = (data.length >> 16) & 0xff;
  result[4] = (data.length >> 24) & 0xff;
  result.set(data, 5);
  return result;
}

function bigIntToBytes(value: bigint, byteCount: number): Uint8Array {
  const result = new Uint8Array(byteCount);
  for (let i = 0; i < byteCount; i++) {
    result[i] = Number((value >> BigInt(i * 8)) & BigInt(0xff));
  }
  return result;
}
