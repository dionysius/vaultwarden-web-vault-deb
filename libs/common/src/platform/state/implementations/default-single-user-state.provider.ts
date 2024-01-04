import { UserId } from "../../../types/guid";
import {
  AbstractMemoryStorageService,
  AbstractStorageService,
  ObservableStorageService,
} from "../../abstractions/storage.service";
import { KeyDefinition } from "../key-definition";
import { StorageLocation } from "../state-definition";
import { SingleUserState } from "../user-state";
import { SingleUserStateProvider } from "../user-state.provider";

import { DefaultSingleUserState } from "./default-single-user-state";

export class DefaultSingleUserStateProvider implements SingleUserStateProvider {
  private cache: Record<string, SingleUserState<unknown>> = {};

  constructor(
    protected memoryStorage: AbstractMemoryStorageService & ObservableStorageService,
    protected diskStorage: AbstractStorageService & ObservableStorageService,
  ) {}

  get<T>(userId: UserId, keyDefinition: KeyDefinition<T>): SingleUserState<T> {
    const cacheKey = keyDefinition.buildCacheKey("user", userId);
    const existingUserState = this.cache[cacheKey];
    if (existingUserState != null) {
      // I have to cast out of the unknown generic but this should be safe if rules
      // around domain token are made
      return existingUserState as SingleUserState<T>;
    }

    const newUserState = this.buildSingleUserState(userId, keyDefinition);
    this.cache[cacheKey] = newUserState;
    return newUserState;
  }

  protected buildSingleUserState<T>(
    userId: UserId,
    keyDefinition: KeyDefinition<T>,
  ): SingleUserState<T> {
    return new DefaultSingleUserState<T>(
      userId,
      keyDefinition,
      this.getLocation(keyDefinition.stateDefinition.storageLocation),
    );
  }

  private getLocation(location: StorageLocation) {
    switch (location) {
      case "disk":
        return this.diskStorage;
      case "memory":
        return this.memoryStorage;
    }
  }
}
