import { Jsonify } from "type-fest";

import { AbstractStorageService } from "../../abstractions/storage.service";

export async function getStoredValue<T>(
  key: string,
  storage: AbstractStorageService,
  deserializer: (jsonValue: Jsonify<T>) => T,
) {
  if (storage.valuesRequireDeserialization) {
    const jsonValue = await storage.get<Jsonify<T>>(key);
    const value = deserializer(jsonValue);
    return value;
  } else {
    const value = await storage.get<T>(key);
    return value ?? null;
  }
}
