import { NgZone } from "@angular/core";
import { Observable } from "rxjs";

import {
  AbstractStorageService,
  ObservableStorageService,
} from "@bitwarden/common/platform/abstractions/storage.service";
import { DeriveDefinition, DerivedState } from "@bitwarden/common/platform/state";
// eslint-disable-next-line import/no-restricted-paths -- extending this class for this client
import { DefaultDerivedStateProvider } from "@bitwarden/common/platform/state/implementations/default-derived-state.provider";
import { DerivedStateDependencies } from "@bitwarden/common/src/types/state";

import { ForegroundDerivedState } from "./foreground-derived-state";

export class ForegroundDerivedStateProvider extends DefaultDerivedStateProvider {
  constructor(
    memoryStorage: AbstractStorageService & ObservableStorageService,
    private ngZone: NgZone,
  ) {
    super(memoryStorage);
  }
  override buildDerivedState<TFrom, TTo, TDeps extends DerivedStateDependencies>(
    _parentState$: Observable<TFrom>,
    deriveDefinition: DeriveDefinition<TFrom, TTo, TDeps>,
    _dependencies: TDeps,
  ): DerivedState<TTo> {
    return new ForegroundDerivedState(deriveDefinition, this.memoryStorage, this.ngZone);
  }
}
