const KDBX_TIME_BASE = new Date('0001-01-01T00:00:00Z');

export function kdbxTimeToDate(base64: string): Date {
  if (!base64) return new Date();
  try {
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    if (bytes.length < 8) return new Date();
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const seconds = view.getBigInt64(0, true);
    return new Date(KDBX_TIME_BASE.getTime() + Number(seconds) * 1000);
  } catch { return new Date(); }
}

export function dateToKdbxTime(date: Date): string {
  const seconds = BigInt(Math.floor((date.getTime() - KDBX_TIME_BASE.getTime()) / 1000));
  const bytes = new Uint8Array(8);
  new DataView(bytes.buffer).setBigInt64(0, seconds, true);
  return btoa(String.fromCharCode(...bytes));
}

export function base64ToBytes(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

export function bytesToBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

export function parseKDBXTime(text: string | null | undefined): Date | undefined {
  if (!text) return undefined;
  
  if (text.includes('T') && text.includes('-')) {
    const date = new Date(text);
    if (!isNaN(date.getTime())) return date;
  }
  
  try {
    return kdbxTimeToDate(text);
  } catch {
    return undefined;
  }
}

export function formatKDBXTime(date: Date): string {
  return dateToKdbxTime(date);
}
