export function uuidToBytes(uuid: string): Uint8Array {
  const clean = uuid.replace(/-/g, '').toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(clean)) throw new Error('Invalid UUID format');
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

export function bytesToUuid(bytes: Uint8Array): string {
  if (bytes.length !== 16) throw new Error('UUID must be 16 bytes');
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}

export const uuidBytesToHex = bytesToUuid;

export function hexToUuidBytes(hex: string): Uint8Array {
  const clean = hex.replace(/-/g, '').toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(clean)) throw new Error('Invalid UUID hex');
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}
