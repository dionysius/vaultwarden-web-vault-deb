import { KdfConfig } from "../../auth/models/domain/kdf-config";
import { RangeWithDefault } from "../misc/range-with-default";

export enum KdfType {
  PBKDF2_SHA256 = 0,
  Argon2id = 1,
}

export const ARGON2_MEMORY = new RangeWithDefault(16, 1024, 64);
export const ARGON2_PARALLELISM = new RangeWithDefault(1, 16, 4);
export const ARGON2_ITERATIONS = new RangeWithDefault(2, 10, 3);

export const DEFAULT_KDF_TYPE = KdfType.PBKDF2_SHA256;
export const PBKDF2_ITERATIONS = new RangeWithDefault(600_000, 2_000_000, 600_000);
export const DEFAULT_KDF_CONFIG = new KdfConfig(PBKDF2_ITERATIONS.defaultValue);
