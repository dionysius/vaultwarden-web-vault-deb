import { KdfConfig } from "../models/domain/kdf-config";

export enum KdfType {
  PBKDF2_SHA256 = 0,
  Argon2id = 1,
}

export const DEFAULT_ARGON2_MEMORY = 64;
export const DEFAULT_ARGON2_PARALLELISM = 4;
export const DEFAULT_ARGON2_ITERATIONS = 3;

export const DEFAULT_KDF_TYPE = KdfType.PBKDF2_SHA256;
export const DEFAULT_PBKDF2_ITERATIONS = 600000;
export const DEFAULT_KDF_CONFIG = new KdfConfig(DEFAULT_PBKDF2_ITERATIONS);
export const SEND_KDF_ITERATIONS = 100000;
