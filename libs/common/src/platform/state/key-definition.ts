import { Jsonify, Opaque } from "type-fest";

import { UserId } from "../../types/guid";
import { Utils } from "../misc/utils";

import { StateDefinition } from "./state-definition";

/**
 * KeyDefinitions describe the precise location to store data for a given piece of state.
 * The StateDefinition is used to describe the domain of the state, and the KeyDefinition
 * sub-divides that domain into specific keys.
 */
export class KeyDefinition<T> {
  /**
   * Creates a new instance of a KeyDefinition
   * @param stateDefinition The state definition for which this key belongs to.
   * @param key The name of the key, this should be unique per domain
   * @param deserializer A function to use to safely convert your type from json to your expected type.
   */
  constructor(
    readonly stateDefinition: StateDefinition,
    readonly key: string,
    readonly deserializer: (jsonValue: Jsonify<T>) => T
  ) {}

  /**
   * Creates a {@link KeyDefinition} for state that is an array.
   * @param stateDefinition The state definition to be added to the KeyDefinition
   * @param key The key to be added to the KeyDefinition
   * @param deserializer The deserializer for the element of the array in your state.
   * @returns A {@link KeyDefinition} that contains a serializer that will run the provided deserializer for each
   * element of an array **unless that array is null in which case it will return an empty list.**
   */
  static array<T>(
    stateDefinition: StateDefinition,
    key: string,
    deserializer: (jsonValue: Jsonify<T>) => T
  ) {
    return new KeyDefinition<T[]>(stateDefinition, key, (jsonValue) => {
      return jsonValue?.map((v) => deserializer(v)) ?? [];
    });
  }

  /**
   * Creates a {@link KeyDefinition} for state that is a record.
   * @param stateDefinition The state definition to be added to the KeyDefinition
   * @param key The key to be added to the KeyDefinition
   * @param deserializer The deserializer for the value part of a record.
   * @returns A {@link KeyDefinition} that contains a serializer that will run the provided deserializer for each
   * value in a record and returns every key as a string **unless that record is null in which case it will return an record.**
   */
  static record<T>(
    stateDefinition: StateDefinition,
    key: string,
    deserializer: (jsonValue: Jsonify<T>) => T
  ) {
    return new KeyDefinition<Record<string, T>>(stateDefinition, key, (jsonValue) => {
      const output: Record<string, T> = {};

      if (jsonValue == null) {
        return output;
      }

      for (const key in jsonValue) {
        output[key] = deserializer((jsonValue as Record<string, Jsonify<T>>)[key]);
      }
      return output;
    });
  }

  /**
   *
   * @returns
   */
  buildCacheKey(): string {
    return `${this.stateDefinition.storageLocation}_${this.stateDefinition.name}_${this.key}`;
  }
}

export type StorageKey = Opaque<string, "StorageKey">;

/**
 * Creates a {@link StorageKey} that points to the data at the given key definition for the specified user.
 * @param userId The userId of the user you want the key to be for.
 * @param keyDefinition The key definition of which data the key should point to.
 * @returns A key that is ready to be used in a storage service to get data.
 */
export function userKeyBuilder(userId: UserId, keyDefinition: KeyDefinition<unknown>): StorageKey {
  if (!Utils.isGuid(userId)) {
    throw new Error("You cannot build a user key without a valid UserId");
  }
  return `user_${userId}_${keyDefinition.stateDefinition.name}_${keyDefinition.key}` as StorageKey;
}

/**
 * Creates a {@link StorageKey}
 * @param keyDefinition The key definition of which data the key should point to.
 * @returns A key that is ready to be used in a storage service to get data.
 */
export function globalKeyBuilder(keyDefinition: KeyDefinition<unknown>): StorageKey {
  return `global_${keyDefinition.stateDefinition.name}_${keyDefinition.key}` as StorageKey;
}
