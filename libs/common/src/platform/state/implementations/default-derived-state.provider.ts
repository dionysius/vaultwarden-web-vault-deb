import { Observable } from "rxjs";

import { DerivedStateDependencies } from "../../../types/state";
import {
  AbstractStorageService,
  ObservableStorageService,
} from "../../abstractions/storage.service";
import { StorageServiceProvider } from "../../services/storage-service.provider";
import { DeriveDefinition } from "../derive-definition";
import { DerivedState } from "../derived-state";
import { DerivedStateProvider } from "../derived-state.provider";

import { DefaultDerivedState } from "./default-derived-state";

export class DefaultDerivedStateProvider implements DerivedStateProvider {
  private cache: Record<string, DerivedState<unknown>> = {};

  constructor(protected storageServiceProvider: StorageServiceProvider) {}

  get<TFrom, TTo, TDeps extends DerivedStateDependencies>(
    parentState$: Observable<TFrom>,
    deriveDefinition: DeriveDefinition<TFrom, TTo, TDeps>,
    dependencies: TDeps,
  ): DerivedState<TTo> {
    // TODO: we probably want to support optional normal memory storage for browser
    const [location, storageService] = this.storageServiceProvider.get("memory", {
      browser: "memory-large-object",
    });
    const cacheKey = deriveDefinition.buildCacheKey(location);
    const existingDerivedState = this.cache[cacheKey];
    if (existingDerivedState != null) {
      // I have to cast out of the unknown generic but this should be safe if rules
      // around domain token are made
      return existingDerivedState as DefaultDerivedState<TFrom, TTo, TDeps>;
    }

    const newDerivedState = this.buildDerivedState(parentState$, deriveDefinition, dependencies, [
      location,
      storageService,
    ]);
    this.cache[cacheKey] = newDerivedState;
    return newDerivedState;
  }

  protected buildDerivedState<TFrom, TTo, TDeps extends DerivedStateDependencies>(
    parentState$: Observable<TFrom>,
    deriveDefinition: DeriveDefinition<TFrom, TTo, TDeps>,
    dependencies: TDeps,
    storageLocation: [string, AbstractStorageService & ObservableStorageService],
  ): DerivedState<TTo> {
    return new DefaultDerivedState<TFrom, TTo, TDeps>(
      parentState$,
      deriveDefinition,
      storageLocation[1],
      dependencies,
    );
  }
}
