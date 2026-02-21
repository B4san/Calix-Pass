export function secureZero(buffer: Uint8Array): void {
  for (let i = 0; i < buffer.length; i++) buffer[i] = 0;
}
