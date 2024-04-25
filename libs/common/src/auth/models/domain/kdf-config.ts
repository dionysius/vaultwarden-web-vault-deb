import { Jsonify } from "type-fest";

import {
  ARGON2_ITERATIONS,
  ARGON2_MEMORY,
  ARGON2_PARALLELISM,
  KdfType,
  PBKDF2_ITERATIONS,
} from "../../../platform/enums/kdf-type.enum";

/**
 * Represents a type safe KDF configuration.
 */
export type KdfConfig = PBKDF2KdfConfig | Argon2KdfConfig;

/**
 * Password-Based Key Derivation Function 2 (PBKDF2) KDF configuration.
 */
export class PBKDF2KdfConfig {
  kdfType: KdfType.PBKDF2_SHA256 = KdfType.PBKDF2_SHA256;
  iterations: number;

  constructor(iterations?: number) {
    this.iterations = iterations ?? PBKDF2_ITERATIONS.defaultValue;
  }

  /**
   * Validates the PBKDF2 KDF configuration.
   * A Valid PBKDF2 KDF configuration has KDF iterations between the 600_000 and 2_000_000.
   */
  validateKdfConfig(): void {
    if (!PBKDF2_ITERATIONS.inRange(this.iterations)) {
      throw new Error(
        `PBKDF2 iterations must be between ${PBKDF2_ITERATIONS.min} and ${PBKDF2_ITERATIONS.max}`,
      );
    }
  }

  static fromJSON(json: Jsonify<PBKDF2KdfConfig>): PBKDF2KdfConfig {
    return new PBKDF2KdfConfig(json.iterations);
  }
}

/**
 * Argon2 KDF configuration.
 */
export class Argon2KdfConfig {
  kdfType: KdfType.Argon2id = KdfType.Argon2id;
  iterations: number;
  memory: number;
  parallelism: number;

  constructor(iterations?: number, memory?: number, parallelism?: number) {
    this.iterations = iterations ?? ARGON2_ITERATIONS.defaultValue;
    this.memory = memory ?? ARGON2_MEMORY.defaultValue;
    this.parallelism = parallelism ?? ARGON2_PARALLELISM.defaultValue;
  }

  /**
   * Validates the Argon2 KDF configuration.
   * A Valid Argon2 KDF configuration has iterations between 2 and 10, memory between 16mb and 1024mb, and parallelism between 1 and 16.
   */
  validateKdfConfig(): void {
    if (!ARGON2_ITERATIONS.inRange(this.iterations)) {
      throw new Error(
        `Argon2 iterations must be between ${ARGON2_ITERATIONS.min} and ${ARGON2_ITERATIONS.max}`,
      );
    }

    if (!ARGON2_MEMORY.inRange(this.memory)) {
      throw new Error(
        `Argon2 memory must be between ${ARGON2_MEMORY.min}mb and ${ARGON2_MEMORY.max}mb`,
      );
    }

    if (!ARGON2_PARALLELISM.inRange(this.parallelism)) {
      throw new Error(
        `Argon2 parallelism must be between ${ARGON2_PARALLELISM.min} and ${ARGON2_PARALLELISM.max}.`,
      );
    }
  }

  static fromJSON(json: Jsonify<Argon2KdfConfig>): Argon2KdfConfig {
    return new Argon2KdfConfig(json.iterations, json.memory, json.parallelism);
  }
}
