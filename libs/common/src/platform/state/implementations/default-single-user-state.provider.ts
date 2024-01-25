import { UserId } from "../../../types/guid";
import {
  AbstractMemoryStorageService,
  AbstractStorageService,
  ObservableStorageService,
} from "../../abstractions/storage.service";
import { KeyDefinition } from "../key-definition";
import { StateDefinition } from "../state-definition";
import { SingleUserState } from "../user-state";
import { SingleUserStateProvider } from "../user-state.provider";

import { DefaultSingleUserState } from "./default-single-user-state";

export class DefaultSingleUserStateProvider implements SingleUserStateProvider {
  private cache: Record<string, SingleUserState<unknown>> = {};

  constructor(
    protected readonly memoryStorage: AbstractMemoryStorageService & ObservableStorageService,
    protected readonly diskStorage: AbstractStorageService & ObservableStorageService,
  ) {}

  get<T>(userId: UserId, keyDefinition: KeyDefinition<T>): SingleUserState<T> {
    const cacheKey = this.buildCacheKey(userId, keyDefinition);
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

  private buildCacheKey(userId: UserId, keyDefinition: KeyDefinition<unknown>) {
    return `${this.getLocationString(keyDefinition)}_${keyDefinition.fullName}_${userId}`;
  }

  protected buildSingleUserState<T>(
    userId: UserId,
    keyDefinition: KeyDefinition<T>,
  ): SingleUserState<T> {
    return new DefaultSingleUserState<T>(
      userId,
      keyDefinition,
      this.getLocation(keyDefinition.stateDefinition),
    );
  }

  protected getLocationString(keyDefinition: KeyDefinition<unknown>): string {
    return keyDefinition.stateDefinition.defaultStorageLocation;
  }

  protected getLocation(stateDefinition: StateDefinition) {
    // The default implementations don't support the client overrides
    // it is up to the client to extend this class and add that support
    switch (stateDefinition.defaultStorageLocation) {
      case "disk":
        return this.diskStorage;
      case "memory":
        return this.memoryStorage;
    }
  }
}
