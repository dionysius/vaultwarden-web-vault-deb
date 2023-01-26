export enum KdfType {
  PBKDF2_SHA256 = 0,
  Argon2id = 1,
}

export const DEFAULT_ARGON2_MEMORY = 19;
export const DEFAULT_ARGON2_PARALLELISM = 1;
export const DEFAULT_ARGON2_ITERATIONS = 2;

export const DEFAULT_KDF_TYPE = KdfType.PBKDF2_SHA256;
export const DEFAULT_PBKDF2_ITERATIONS = 600000;
export const SEND_KDF_ITERATIONS = 100000;
