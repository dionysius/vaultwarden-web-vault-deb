import {
  Observable,
  ReplaySubject,
  combineLatest,
  defer,
  filter,
  firstValueFrom,
  merge,
  of,
  share,
  switchMap,
  timeout,
  timer,
} from "rxjs";

import { UserId } from "../../../types/guid";
import {
  AbstractStorageService,
  ObservableStorageService,
} from "../../abstractions/storage.service";
import { KeyDefinition, userKeyBuilder } from "../key-definition";
import { StateUpdateOptions, populateOptionsWithDefault } from "../state-update-options";
import { CombinedState, SingleUserState } from "../user-state";

import { getStoredValue } from "./util";

export class DefaultSingleUserState<T> implements SingleUserState<T> {
  private storageKey: string;
  private updatePromise: Promise<T> | null = null;

  readonly state$: Observable<T>;
  readonly combinedState$: Observable<CombinedState<T>>;

  constructor(
    readonly userId: UserId,
    private keyDefinition: KeyDefinition<T>,
    private chosenLocation: AbstractStorageService & ObservableStorageService,
  ) {
    this.storageKey = userKeyBuilder(this.userId, this.keyDefinition);
    const initialStorageGet$ = defer(() => {
      return getStoredValue(this.storageKey, this.chosenLocation, this.keyDefinition.deserializer);
    });

    const latestStorage$ = chosenLocation.updates$.pipe(
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

    this.combinedState$ = combineLatest([of(userId), this.state$]);
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
}
