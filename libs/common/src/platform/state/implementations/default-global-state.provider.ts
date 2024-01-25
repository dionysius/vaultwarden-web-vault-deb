import {
  AbstractMemoryStorageService,
  AbstractStorageService,
  ObservableStorageService,
} from "../../abstractions/storage.service";
import { GlobalState } from "../global-state";
import { GlobalStateProvider } from "../global-state.provider";
import { KeyDefinition } from "../key-definition";
import { StateDefinition } from "../state-definition";

import { DefaultGlobalState } from "./default-global-state";

export class DefaultGlobalStateProvider implements GlobalStateProvider {
  private globalStateCache: Record<string, GlobalState<unknown>> = {};

  constructor(
    protected readonly memoryStorage: AbstractMemoryStorageService & ObservableStorageService,
    protected readonly diskStorage: AbstractStorageService & ObservableStorageService,
  ) {}

  get<T>(keyDefinition: KeyDefinition<T>): GlobalState<T> {
    const cacheKey = this.buildCacheKey(keyDefinition);
    const existingGlobalState = this.globalStateCache[cacheKey];
    if (existingGlobalState != null) {
      // The cast into the actual generic is safe because of rules around key definitions
      // being unique.
      return existingGlobalState as DefaultGlobalState<T>;
    }

    const newGlobalState = new DefaultGlobalState<T>(
      keyDefinition,
      this.getLocation(keyDefinition.stateDefinition),
    );

    this.globalStateCache[cacheKey] = newGlobalState;
    return newGlobalState;
  }

  private buildCacheKey(keyDefinition: KeyDefinition<unknown>) {
    return `${this.getLocationString(keyDefinition)}_${keyDefinition.fullName}`;
  }

  protected getLocationString(keyDefinition: KeyDefinition<unknown>): string {
    return keyDefinition.stateDefinition.defaultStorageLocation;
  }

  protected getLocation(stateDefinition: StateDefinition) {
    const location = stateDefinition.defaultStorageLocation;
    switch (location) {
      case "disk":
        return this.diskStorage;
      case "memory":
        return this.memoryStorage;
    }
  }
}
