import { AccountService } from "../../../auth/abstractions/account.service";
import {
  AbstractMemoryStorageService,
  AbstractStorageService,
  ObservableStorageService,
} from "../../abstractions/storage.service";
import { KeyDefinition } from "../key-definition";
import { StateDefinition } from "../state-definition";
import { ActiveUserState } from "../user-state";
import { ActiveUserStateProvider } from "../user-state.provider";

import { DefaultActiveUserState } from "./default-active-user-state";

export class DefaultActiveUserStateProvider implements ActiveUserStateProvider {
  private cache: Record<string, ActiveUserState<unknown>> = {};

  constructor(
    protected readonly accountService: AccountService,
    protected readonly memoryStorage: AbstractMemoryStorageService & ObservableStorageService,
    protected readonly diskStorage: AbstractStorageService & ObservableStorageService,
  ) {}

  get<T>(keyDefinition: KeyDefinition<T>): ActiveUserState<T> {
    const cacheKey = this.buildCacheKey(keyDefinition);
    const existingUserState = this.cache[cacheKey];
    if (existingUserState != null) {
      // I have to cast out of the unknown generic but this should be safe if rules
      // around domain token are made
      return existingUserState as ActiveUserState<T>;
    }

    const newUserState = this.buildActiveUserState(keyDefinition);
    this.cache[cacheKey] = newUserState;
    return newUserState;
  }

  private buildCacheKey(keyDefinition: KeyDefinition<unknown>) {
    return `${this.getLocationString(keyDefinition)}_${keyDefinition.fullName}`;
  }

  protected buildActiveUserState<T>(keyDefinition: KeyDefinition<T>): ActiveUserState<T> {
    return new DefaultActiveUserState<T>(
      keyDefinition,
      this.accountService,
      this.getLocation(keyDefinition.stateDefinition),
    );
  }

  protected getLocationString(keyDefinition: KeyDefinition<unknown>): string {
    return keyDefinition.stateDefinition.defaultStorageLocation;
  }

  protected getLocation(stateDefinition: StateDefinition) {
    // The default implementations don't support the client overrides
    // it is up to the client to extend this class and add that support
    const location = stateDefinition.defaultStorageLocation;
    switch (location) {
      case "disk":
        return this.diskStorage;
      case "memory":
        return this.memoryStorage;
    }
  }
}
