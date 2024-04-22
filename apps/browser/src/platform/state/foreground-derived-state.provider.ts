import { NgZone } from "@angular/core";
import { Observable } from "rxjs";

import {
  AbstractStorageService,
  ObservableStorageService,
} from "@bitwarden/common/platform/abstractions/storage.service";
import { StorageServiceProvider } from "@bitwarden/common/platform/services/storage-service.provider";
import { DeriveDefinition, DerivedState } from "@bitwarden/common/platform/state";
// eslint-disable-next-line import/no-restricted-paths -- extending this class for this client
import { DefaultDerivedStateProvider } from "@bitwarden/common/platform/state/implementations/default-derived-state.provider";
import { DerivedStateDependencies } from "@bitwarden/common/src/types/state";

import { ForegroundDerivedState } from "./foreground-derived-state";

export class ForegroundDerivedStateProvider extends DefaultDerivedStateProvider {
  constructor(
    storageServiceProvider: StorageServiceProvider,
    private ngZone: NgZone,
  ) {
    super(storageServiceProvider);
  }
  override buildDerivedState<TFrom, TTo, TDeps extends DerivedStateDependencies>(
    _parentState$: Observable<TFrom>,
    deriveDefinition: DeriveDefinition<TFrom, TTo, TDeps>,
    _dependencies: TDeps,
    storageLocation: [string, AbstractStorageService & ObservableStorageService],
  ): DerivedState<TTo> {
    const [cacheKey, storageService] = storageLocation;
    return new ForegroundDerivedState(deriveDefinition, storageService, cacheKey, this.ngZone);
  }
}
