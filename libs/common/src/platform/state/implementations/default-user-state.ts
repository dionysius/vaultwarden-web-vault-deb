import {
  Observable,
  BehaviorSubject,
  map,
  shareReplay,
  switchMap,
  tap,
  defer,
  firstValueFrom,
  combineLatestWith,
  filter,
  timeout,
} from "rxjs";

import { AccountService } from "../../../auth/abstractions/account.service";
import { UserId } from "../../../types/guid";
import { EncryptService } from "../../abstractions/encrypt.service";
import { AbstractStorageService } from "../../abstractions/storage.service";
import { DerivedUserState } from "../derived-user-state";
import { KeyDefinition, userKeyBuilder } from "../key-definition";
import { StateUpdateOptions, populateOptionsWithDefault } from "../state-update-options";
import { Converter, UserState } from "../user-state";

import { DefaultDerivedUserState } from "./default-derived-state";
import { getStoredValue } from "./util";

const FAKE_DEFAULT = Symbol("fakeDefault");

export class DefaultUserState<T> implements UserState<T> {
  private formattedKey$: Observable<string>;

  protected stateSubject: BehaviorSubject<T | typeof FAKE_DEFAULT> = new BehaviorSubject<
    T | typeof FAKE_DEFAULT
  >(FAKE_DEFAULT);
  private stateSubject$ = this.stateSubject.asObservable();

  state$: Observable<T>;

  constructor(
    protected keyDefinition: KeyDefinition<T>,
    private accountService: AccountService,
    private encryptService: EncryptService,
    private chosenStorageLocation: AbstractStorageService
  ) {
    this.formattedKey$ = this.accountService.activeAccount$.pipe(
      map((account) =>
        account != null && account.id != null
          ? userKeyBuilder(account.id, this.keyDefinition)
          : null
      ),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    const activeAccountData$ = this.formattedKey$.pipe(
      switchMap(async (key) => {
        if (key == null) {
          return FAKE_DEFAULT;
        }
        return await getStoredValue(
          key,
          this.chosenStorageLocation,
          this.keyDefinition.deserializer
        );
      }),
      // Share the execution
      shareReplay({ refCount: false, bufferSize: 1 })
    );

    const storageUpdates$ = this.chosenStorageLocation.updates$.pipe(
      combineLatestWith(this.formattedKey$),
      filter(([update, key]) => key !== null && update.key === key),
      switchMap(async ([update, key]) => {
        if (update.updateType === "remove") {
          return null;
        }
        const data = await getStoredValue(
          key,
          this.chosenStorageLocation,
          this.keyDefinition.deserializer
        );
        return data;
      })
    );

    // Whomever subscribes to this data, should be notified of updated data
    // if someone calls my update() method, or the active user changes.
    this.state$ = defer(() => {
      const accountChangeSubscription = activeAccountData$.subscribe((data) => {
        this.stateSubject.next(data);
      });
      const storageUpdateSubscription = storageUpdates$.subscribe((data) => {
        this.stateSubject.next(data);
      });

      return this.stateSubject$.pipe(
        tap({
          complete: () => {
            accountChangeSubscription.unsubscribe();
            storageUpdateSubscription.unsubscribe();
          },
        })
      );
    })
      // I fake the generic here because I am filtering out the other union type
      // and this makes it so that typescript understands the true type
      .pipe(filter<T>((value) => value != FAKE_DEFAULT));
  }

  async update<TCombine>(
    configureState: (state: T, dependency: TCombine) => T,
    options: StateUpdateOptions<T, TCombine> = {}
  ): Promise<T> {
    options = populateOptionsWithDefault(options);
    const key = await this.createKey();
    const currentState = await this.getGuaranteedState(key);
    const combinedDependencies =
      options.combineLatestWith != null
        ? await firstValueFrom(options.combineLatestWith.pipe(timeout(options.msTimeout)))
        : null;

    if (!options.shouldUpdate(currentState, combinedDependencies)) {
      return;
    }

    const newState = configureState(currentState, combinedDependencies);
    await this.saveToStorage(key, newState);
    return newState;
  }

  async updateFor<TCombine>(
    userId: UserId,
    configureState: (state: T, dependencies: TCombine) => T,
    options: StateUpdateOptions<T, TCombine> = {}
  ): Promise<T> {
    if (userId == null) {
      throw new Error("Attempting to update user state, but no userId has been supplied.");
    }
    options = populateOptionsWithDefault(options);

    const key = userKeyBuilder(userId, this.keyDefinition);
    const currentState = await getStoredValue(
      key,
      this.chosenStorageLocation,
      this.keyDefinition.deserializer
    );
    const combinedDependencies =
      options.combineLatestWith != null
        ? await firstValueFrom(options.combineLatestWith.pipe(timeout(options.msTimeout)))
        : null;

    if (!options.shouldUpdate(currentState, combinedDependencies)) {
      return;
    }

    const newState = configureState(currentState, combinedDependencies);
    await this.saveToStorage(key, newState);

    return newState;
  }

  async getFromState(): Promise<T> {
    const key = await this.createKey();
    return await getStoredValue(key, this.chosenStorageLocation, this.keyDefinition.deserializer);
  }

  createDerived<TTo>(converter: Converter<T, TTo>): DerivedUserState<TTo> {
    return new DefaultDerivedUserState<T, TTo>(converter, this.encryptService, this);
  }

  protected async createKey(): Promise<string> {
    const formattedKey = await firstValueFrom(this.formattedKey$);
    if (formattedKey == null) {
      throw new Error("Cannot create a key while there is no active user.");
    }
    return formattedKey;
  }

  protected async getGuaranteedState(key: string) {
    const currentValue = this.stateSubject.getValue();
    return currentValue === FAKE_DEFAULT ? await this.seedInitial(key) : currentValue;
  }

  private async seedInitial(key: string): Promise<T> {
    const value = await getStoredValue(
      key,
      this.chosenStorageLocation,
      this.keyDefinition.deserializer
    );
    this.stateSubject.next(value);
    return value;
  }

  protected saveToStorage(key: string, data: T): Promise<void> {
    return this.chosenStorageLocation.save(key, data);
  }
}
