import { AccountService } from "../../../auth/abstractions/account.service";
import { EncryptService } from "../../abstractions/encrypt.service";
import {
  AbstractMemoryStorageService,
  AbstractStorageService,
  ObservableStorageService,
} from "../../abstractions/storage.service";
import { KeyDefinition } from "../key-definition";
import { StorageLocation } from "../state-definition";
import { ActiveUserState } from "../user-state";
import { ActiveUserStateProvider } from "../user-state.provider";

import { DefaultActiveUserState } from "./default-active-user-state";

export class DefaultActiveUserStateProvider implements ActiveUserStateProvider {
  private cache: Record<string, ActiveUserState<unknown>> = {};

  constructor(
    protected accountService: AccountService,
    protected encryptService: EncryptService,
    protected memoryStorage: AbstractMemoryStorageService & ObservableStorageService,
    protected diskStorage: AbstractStorageService & ObservableStorageService,
  ) {}

  get<T>(keyDefinition: KeyDefinition<T>): ActiveUserState<T> {
    const cacheKey = keyDefinition.buildCacheKey("user", "active");
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

  protected buildActiveUserState<T>(keyDefinition: KeyDefinition<T>): ActiveUserState<T> {
    return new DefaultActiveUserState<T>(
      keyDefinition,
      this.accountService,
      this.encryptService,
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
