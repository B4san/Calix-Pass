export function readUInt32LE(buffer: Uint8Array, offset: number): number {
  return ((buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16) | (buffer[offset + 3] << 24)) >>> 0);
}

export function writeUInt32LE(buffer: Uint8Array, value: number, offset: number): void {
  buffer[offset] = value & 0xff;
  buffer[offset + 1] = (value >>> 8) & 0xff;
  buffer[offset + 2] = (value >>> 16) & 0xff;
  buffer[offset + 3] = (value >>> 24) & 0xff;
}

export function readUInt64LE(buffer: Uint8Array, offset: number): bigint {
  const low = BigInt(readUInt32LE(buffer, offset));
  const high = BigInt(readUInt32LE(buffer, offset + 4)) << BigInt(32);
  return high | low;
}

export function writeUInt64LE(buffer: Uint8Array, value: bigint, offset: number): void {
  writeUInt32LE(buffer, Number(value & BigInt(0xffffffff)), offset);
  writeUInt32LE(buffer, Number((value >> BigInt(32)) & BigInt(0xffffffff)), offset + 4);
}
