import { argon2id } from 'hash-wasm';

export interface Argon2Params {
  password: Uint8Array;
  salt: Uint8Array;
  memory: number;
  iterations: number;
  parallelism: number;
  hashLength: number;
}

export async function deriveKeyArgon2id(params: Argon2Params): Promise<Uint8Array> {
  const { password, salt, memory, iterations, parallelism, hashLength } = params;
  return await argon2id({
    password,
    salt,
    memorySize: memory,
    iterations,
    parallelism,
    hashLength,
    outputType: 'binary',
  });
}

export const DEFAULT_ARGON2_PARAMS = {
  memory: 65536,
  iterations: 2,
  parallelism: 2,
  hashLength: 32,
};
