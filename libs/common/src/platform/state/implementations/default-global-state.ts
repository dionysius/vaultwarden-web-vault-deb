import {
  Observable,
  ReplaySubject,
  defer,
  filter,
  firstValueFrom,
  merge,
  share,
  switchMap,
  timeout,
  timer,
} from "rxjs";

import {
  AbstractStorageService,
  ObservableStorageService,
} from "../../abstractions/storage.service";
import { GlobalState } from "../global-state";
import { KeyDefinition, globalKeyBuilder } from "../key-definition";
import { StateUpdateOptions, populateOptionsWithDefault } from "../state-update-options";

import { getStoredValue } from "./util";

export class DefaultGlobalState<T> implements GlobalState<T> {
  private storageKey: string;
  private updatePromise: Promise<T> | null = null;

  readonly state$: Observable<T>;

  constructor(
    private keyDefinition: KeyDefinition<T>,
    private chosenLocation: AbstractStorageService & ObservableStorageService,
  ) {
    this.storageKey = globalKeyBuilder(this.keyDefinition);
    const initialStorageGet$ = defer(() => {
      return getStoredValue(this.storageKey, this.chosenLocation, this.keyDefinition.deserializer);
    });

    const latestStorage$ = this.chosenLocation.updates$.pipe(
      filter((s) => s.key === this.storageKey),
      switchMap(async (storageUpdate) => {
        if (storageUpdate.updateType === "remove") {
          return null;
        }

        return await getStoredValue(
          this.storageKey,
          this.chosenLocation,
          this.keyDefinition.deserializer,
        );
      }),
    );

    this.state$ = merge(initialStorageGet$, latestStorage$).pipe(
      share({
        connector: () => new ReplaySubject<T>(1),
        resetOnRefCountZero: () => timer(this.keyDefinition.cleanupDelayMs),
      }),
    );
  }

  async update<TCombine>(
    configureState: (state: T, dependency: TCombine) => T,
    options: StateUpdateOptions<T, TCombine> = {},
  ): Promise<T> {
    options = populateOptionsWithDefault(options);
    if (this.updatePromise != null) {
      await this.updatePromise;
    }

    try {
      this.updatePromise = this.internalUpdate(configureState, options);
      const newState = await this.updatePromise;
      return newState;
    } finally {
      this.updatePromise = null;
    }
  }

  private async internalUpdate<TCombine>(
    configureState: (state: T, dependency: TCombine) => T,
    options: StateUpdateOptions<T, TCombine>,
  ): Promise<T> {
    const currentState = await this.getStateForUpdate();
    const combinedDependencies =
      options.combineLatestWith != null
        ? await firstValueFrom(options.combineLatestWith.pipe(timeout(options.msTimeout)))
        : null;

    if (!options.shouldUpdate(currentState, combinedDependencies)) {
      return currentState;
    }

    const newState = configureState(currentState, combinedDependencies);
    await this.chosenLocation.save(this.storageKey, newState);
    return newState;
  }

  /** For use in update methods, does not wait for update to complete before yielding state.
   * The expectation is that that await is already done
   */
  private async getStateForUpdate() {
    return await getStoredValue(
      this.storageKey,
      this.chosenLocation,
      this.keyDefinition.deserializer,
    );
  }

  async getFromState(): Promise<T> {
    if (this.updatePromise != null) {
      return await this.updatePromise;
    }
    return await getStoredValue(
      this.storageKey,
      this.chosenLocation,
      this.keyDefinition.deserializer,
    );
  }
}
