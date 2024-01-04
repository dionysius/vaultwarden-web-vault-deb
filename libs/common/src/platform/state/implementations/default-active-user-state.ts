import {
  Observable,
  BehaviorSubject,
  map,
  shareReplay,
  switchMap,
  firstValueFrom,
  combineLatestWith,
  filter,
  timeout,
  Subscription,
  tap,
} from "rxjs";

import { AccountService } from "../../../auth/abstractions/account.service";
import { EncryptService } from "../../abstractions/encrypt.service";
import {
  AbstractStorageService,
  ObservableStorageService,
} from "../../abstractions/storage.service";
import { KeyDefinition, userKeyBuilder } from "../key-definition";
import { StateUpdateOptions, populateOptionsWithDefault } from "../state-update-options";
import { ActiveUserState, activeMarker } from "../user-state";

import { getStoredValue } from "./util";

const FAKE_DEFAULT = Symbol("fakeDefault");

export class DefaultActiveUserState<T> implements ActiveUserState<T> {
  [activeMarker]: true;
  private formattedKey$: Observable<string>;
  private updatePromise: Promise<T> | null = null;
  private storageUpdateSubscription: Subscription;
  private activeAccountUpdateSubscription: Subscription;
  private subscriberCount = new BehaviorSubject<number>(0);
  private stateObservable: Observable<T>;
  private reinitialize = false;

  protected stateSubject: BehaviorSubject<T | typeof FAKE_DEFAULT> = new BehaviorSubject<
    T | typeof FAKE_DEFAULT
  >(FAKE_DEFAULT);
  private stateSubject$ = this.stateSubject.asObservable();

  get state$() {
    this.stateObservable = this.stateObservable ?? this.initializeObservable();
    return this.stateObservable;
  }

  constructor(
    protected keyDefinition: KeyDefinition<T>,
    private accountService: AccountService,
    private encryptService: EncryptService,
    private chosenStorageLocation: AbstractStorageService & ObservableStorageService,
  ) {
    this.formattedKey$ = this.accountService.activeAccount$.pipe(
      map((account) =>
        account != null && account.id != null
          ? userKeyBuilder(account.id, this.keyDefinition)
          : null,
      ),
      tap(() => {
        // We have a new key, so we should forget about previous update promises
        this.updatePromise = null;
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
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

  // TODO: this should be removed
  async getFromState(): Promise<T> {
    const key = await this.createKey();
    return await getStoredValue(key, this.chosenStorageLocation, this.keyDefinition.deserializer);
  }

  private async internalUpdate<TCombine>(
    configureState: (state: T, dependency: TCombine) => T,
    options: StateUpdateOptions<T, TCombine>,
  ) {
    const key = await this.createKey();
    const currentState = await this.getStateForUpdate(key);
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

  private initializeObservable() {
    this.storageUpdateSubscription = this.chosenStorageLocation.updates$
      .pipe(
        combineLatestWith(this.formattedKey$),
        filter(([update, key]) => key !== null && update.key === key),
        switchMap(async ([update, key]) => {
          if (update.updateType === "remove") {
            return null;
          }
          return await this.getState(key);
        }),
      )
      .subscribe((v) => this.stateSubject.next(v));

    this.activeAccountUpdateSubscription = this.formattedKey$
      .pipe(
        switchMap(async (key) => {
          if (key == null) {
            return FAKE_DEFAULT;
          }
          return await this.getState(key);
        }),
      )
      .subscribe((v) => this.stateSubject.next(v));

    this.subscriberCount.subscribe((count) => {
      if (count === 0 && this.stateObservable != null) {
        this.triggerCleanup();
      }
    });

    return new Observable<T>((subscriber) => {
      this.incrementSubscribers();

      // reinitialize listeners after cleanup
      if (this.reinitialize) {
        this.reinitialize = false;
        this.initializeObservable();
      }

      const prevUnsubscribe = subscriber.unsubscribe.bind(subscriber);
      subscriber.unsubscribe = () => {
        this.decrementSubscribers();
        prevUnsubscribe();
      };

      return this.stateSubject
        .pipe(
          // Filter out fake default, which is used to indicate that state is not ready to be emitted yet.
          filter((i) => i !== FAKE_DEFAULT),
        )
        .subscribe(subscriber);
    });
  }

  protected async createKey(): Promise<string> {
    const formattedKey = await firstValueFrom(this.formattedKey$);
    if (formattedKey == null) {
      throw new Error("Cannot create a key while there is no active user.");
    }
    return formattedKey;
  }

  /** For use in update methods, does not wait for update to complete before yielding state.
   * The expectation is that that await is already done
   */
  protected async getStateForUpdate(key: string) {
    const currentValue = this.stateSubject.getValue();
    return currentValue === FAKE_DEFAULT
      ? await getStoredValue(key, this.chosenStorageLocation, this.keyDefinition.deserializer)
      : currentValue;
  }

  /** To be used in observables. Awaits updates to ensure they are complete */
  private async getState(key: string): Promise<T> {
    if (this.updatePromise != null) {
      await this.updatePromise;
    }
    return await getStoredValue(key, this.chosenStorageLocation, this.keyDefinition.deserializer);
  }

  protected saveToStorage(key: string, data: T): Promise<void> {
    return this.chosenStorageLocation.save(key, data);
  }

  private incrementSubscribers() {
    this.subscriberCount.next(this.subscriberCount.value + 1);
  }

  private decrementSubscribers() {
    this.subscriberCount.next(this.subscriberCount.value - 1);
  }

  private triggerCleanup() {
    setTimeout(() => {
      if (this.subscriberCount.value === 0) {
        this.updatePromise = null;
        this.storageUpdateSubscription?.unsubscribe();
        this.activeAccountUpdateSubscription?.unsubscribe();
        this.subscriberCount.complete();
        this.subscriberCount = new BehaviorSubject<number>(0);
        this.stateSubject.next(FAKE_DEFAULT);
        this.reinitialize = true;
      }
    }, this.keyDefinition.cleanupDelayMs);
  }
}
