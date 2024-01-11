import {
  Observable,
  map,
  switchMap,
  firstValueFrom,
  filter,
  timeout,
  merge,
  share,
  ReplaySubject,
  timer,
  tap,
  throwError,
  distinctUntilChanged,
  withLatestFrom,
} from "rxjs";

import { AccountService } from "../../../auth/abstractions/account.service";
import { UserId } from "../../../types/guid";
import {
  AbstractStorageService,
  ObservableStorageService,
} from "../../abstractions/storage.service";
import { KeyDefinition, userKeyBuilder } from "../key-definition";
import { StateUpdateOptions, populateOptionsWithDefault } from "../state-update-options";
import { ActiveUserState, CombinedState, activeMarker } from "../user-state";

import { getStoredValue } from "./util";

const FAKE = Symbol("fake");

export class DefaultActiveUserState<T> implements ActiveUserState<T> {
  [activeMarker]: true;
  private updatePromise: Promise<T> | null = null;

  private activeUserId$: Observable<UserId | null>;

  combinedState$: Observable<CombinedState<T>>;
  state$: Observable<T>;

  constructor(
    protected keyDefinition: KeyDefinition<T>,
    private accountService: AccountService,
    private chosenStorageLocation: AbstractStorageService & ObservableStorageService,
  ) {
    this.activeUserId$ = this.accountService.activeAccount$.pipe(
      // We only care about the UserId but we do want to know about no user as well.
      map((a) => a?.id),
      // To avoid going to storage when we don't need to, only get updates when there is a true change.
      distinctUntilChanged((a, b) => (a == null || b == null ? a == b : a === b)), // Treat null and undefined as equal
    );

    const userChangeAndInitial$ = this.activeUserId$.pipe(
      // If the user has changed, we no longer need to lock an update call
      // since that call will be for a user that is no longer active.
      tap(() => (this.updatePromise = null)),
      switchMap(async (userId) => {
        // We've switched or started off with no active user. So,
        // emit a fake value so that we can fill our share buffer.
        if (userId == null) {
          return FAKE;
        }

        const fullKey = userKeyBuilder(userId, this.keyDefinition);
        const data = await getStoredValue(
          fullKey,
          this.chosenStorageLocation,
          this.keyDefinition.deserializer,
        );
        return [userId, data] as CombinedState<T>;
      }),
    );

    const latestStorage$ = this.chosenStorageLocation.updates$.pipe(
      // Use withLatestFrom so that we do NOT emit when activeUserId changes because that
      // is taken care of above, but we do want to have the latest user id
      // when we get a storage update so we can filter the full key
      withLatestFrom(
        this.activeUserId$.pipe(
          // Null userId is already taken care of through the userChange observable above
          filter((u) => u != null),
          // Take the userId and build the fullKey that we can now create
          map((userId) => [userId, userKeyBuilder(userId, this.keyDefinition)] as const),
        ),
      ),
      // Filter to only storage updates that pertain to our key
      filter(([storageUpdate, [_userId, fullKey]]) => storageUpdate.key === fullKey),
      switchMap(async ([storageUpdate, [userId, fullKey]]) => {
        // We can shortcut on updateType of "remove"
        // and just emit null.
        if (storageUpdate.updateType === "remove") {
          return [userId, null] as CombinedState<T>;
        }

        return [
          userId,
          await getStoredValue(
            fullKey,
            this.chosenStorageLocation,
            this.keyDefinition.deserializer,
          ),
        ] as CombinedState<T>;
      }),
    );

    this.combinedState$ = merge(userChangeAndInitial$, latestStorage$).pipe(
      share({
        connector: () => new ReplaySubject<CombinedState<T> | typeof FAKE>(1),
        resetOnRefCountZero: () => timer(this.keyDefinition.cleanupDelayMs),
      }),
      // Filter out FAKE AFTER the share so that we can fill the ReplaySubjects
      // buffer with something and avoid emitting when there is no active user.
      filter<CombinedState<T>>((d) => d !== (FAKE as unknown)),
    );

    // State should just be combined state without the user id
    this.state$ = this.combinedState$.pipe(map(([_userId, state]) => state));
  }

  async update<TCombine>(
    configureState: (state: T, dependency: TCombine) => T,
    options: StateUpdateOptions<T, TCombine> = {},
  ): Promise<T> {
    options = populateOptionsWithDefault(options);
    try {
      if (this.updatePromise != null) {
        await this.updatePromise;
      }
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
  ) {
    const [key, currentState] = await this.getStateForUpdate();
    const combinedDependencies =
      options.combineLatestWith != null
        ? await firstValueFrom(options.combineLatestWith.pipe(timeout(options.msTimeout)))
        : null;

    if (!options.shouldUpdate(currentState, combinedDependencies)) {
      return currentState;
    }

    const newState = configureState(currentState, combinedDependencies);
    await this.saveToStorage(key, newState);
    return newState;
  }

  /** For use in update methods, does not wait for update to complete before yielding state.
   * The expectation is that that await is already done
   */
  protected async getStateForUpdate() {
    const userId = await firstValueFrom(
      this.activeUserId$.pipe(
        timeout({
          first: 1000,
          with: () => throwError(() => new Error("Timeout while retrieving active user.")),
        }),
      ),
    );
    if (userId == null) {
      throw new Error("No active user at this time.");
    }
    const fullKey = userKeyBuilder(userId, this.keyDefinition);
    return [
      fullKey,
      await getStoredValue(fullKey, this.chosenStorageLocation, this.keyDefinition.deserializer),
    ] as const;
  }

  protected saveToStorage(key: string, data: T): Promise<void> {
    return this.chosenStorageLocation.save(key, data);
  }
}
