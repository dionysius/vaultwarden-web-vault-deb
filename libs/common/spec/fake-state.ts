import { Observable, ReplaySubject, firstValueFrom, map, timeout } from "rxjs";

import {
  DerivedState,
  GlobalState,
  SingleUserState,
  ActiveUserState,
  KeyDefinition,
} from "../src/platform/state";
// eslint-disable-next-line import/no-restricted-paths -- using unexposed options for clean typing in test class
import { StateUpdateOptions } from "../src/platform/state/state-update-options";
// eslint-disable-next-line import/no-restricted-paths -- using unexposed options for clean typing in test class
import { CombinedState, activeMarker } from "../src/platform/state/user-state";
import { UserId } from "../src/types/guid";

import { FakeAccountService } from "./fake-account-service";

const DEFAULT_TEST_OPTIONS: StateUpdateOptions<any, any> = {
  shouldUpdate: () => true,
  combineLatestWith: null,
  msTimeout: 10,
};

function populateOptionsWithDefault(
  options: StateUpdateOptions<any, any>,
): StateUpdateOptions<any, any> {
  return {
    ...DEFAULT_TEST_OPTIONS,
    ...options,
  };
}

export class FakeGlobalState<T> implements GlobalState<T> {
  // eslint-disable-next-line rxjs/no-exposed-subjects -- exposed for testing setup
  stateSubject = new ReplaySubject<T>(1);

  constructor(initialValue?: T) {
    this.stateSubject.next(initialValue ?? null);
  }

  update: <TCombine>(
    configureState: (state: T, dependency: TCombine) => T,
    options?: StateUpdateOptions<T, TCombine>,
  ) => Promise<T> = jest.fn(async (configureState, options) => {
    options = populateOptionsWithDefault(options);
    if (this.stateSubject["_buffer"].length == 0) {
      // throw a more helpful not initialized error
      throw new Error(
        "You must initialize the state with a value before calling update. Try calling `stateSubject.next(initialState)` before calling update",
      );
    }
    const current = await firstValueFrom(this.state$.pipe(timeout(100)));
    const combinedDependencies =
      options.combineLatestWith != null
        ? await firstValueFrom(options.combineLatestWith.pipe(timeout(options.msTimeout)))
        : null;
    if (!options.shouldUpdate(current, combinedDependencies)) {
      return current;
    }
    const newState = configureState(current, combinedDependencies);
    this.stateSubject.next(newState);
    this.nextMock(newState);
    return newState;
  });

  updateMock = this.update as jest.MockedFunction<typeof this.update>;
  nextMock = jest.fn<void, [T]>();

  get state$() {
    return this.stateSubject.asObservable();
  }

  private _keyDefinition: KeyDefinition<T> | null = null;
  get keyDefinition() {
    if (this._keyDefinition == null) {
      throw new Error(
        "Key definition not yet set, usually this means your sut has not asked for this state yet",
      );
    }
    return this._keyDefinition;
  }
  set keyDefinition(value: KeyDefinition<T>) {
    this._keyDefinition = value;
  }
}

export class FakeSingleUserState<T> implements SingleUserState<T> {
  // eslint-disable-next-line rxjs/no-exposed-subjects -- exposed for testing setup
  stateSubject = new ReplaySubject<CombinedState<T>>(1);

  state$: Observable<T>;
  combinedState$: Observable<CombinedState<T>>;

  constructor(
    readonly userId: UserId,
    initialValue?: T,
  ) {
    this.stateSubject.next([userId, initialValue ?? null]);

    this.combinedState$ = this.stateSubject.asObservable();
    this.state$ = this.combinedState$.pipe(map(([_userId, state]) => state));
  }

  nextState(state: T) {
    this.stateSubject.next([this.userId, state]);
  }

  async update<TCombine>(
    configureState: (state: T, dependency: TCombine) => T,
    options?: StateUpdateOptions<T, TCombine>,
  ): Promise<T> {
    options = populateOptionsWithDefault(options);
    const current = await firstValueFrom(this.state$.pipe(timeout(options.msTimeout)));
    const combinedDependencies =
      options.combineLatestWith != null
        ? await firstValueFrom(options.combineLatestWith.pipe(timeout(options.msTimeout)))
        : null;
    if (!options.shouldUpdate(current, combinedDependencies)) {
      return current;
    }
    const newState = configureState(current, combinedDependencies);
    this.stateSubject.next([this.userId, newState]);
    this.nextMock(newState);
    return newState;
  }

  updateMock = this.update as jest.MockedFunction<typeof this.update>;

  nextMock = jest.fn<void, [T]>();
  private _keyDefinition: KeyDefinition<T> | null = null;
  get keyDefinition() {
    if (this._keyDefinition == null) {
      throw new Error(
        "Key definition not yet set, usually this means your sut has not asked for this state yet",
      );
    }
    return this._keyDefinition;
  }
  set keyDefinition(value: KeyDefinition<T>) {
    this._keyDefinition = value;
  }
}
export class FakeActiveUserState<T> implements ActiveUserState<T> {
  [activeMarker]: true;

  // eslint-disable-next-line rxjs/no-exposed-subjects -- exposed for testing setup
  stateSubject = new ReplaySubject<CombinedState<T>>(1);

  state$: Observable<T>;
  combinedState$: Observable<CombinedState<T>>;

  constructor(
    private accountService: FakeAccountService,
    initialValue?: T,
  ) {
    this.stateSubject.next([accountService.activeUserId, initialValue ?? null]);

    this.combinedState$ = this.stateSubject.asObservable();
    this.state$ = this.combinedState$.pipe(map(([_userId, state]) => state));
  }

  get userId() {
    return this.accountService.activeUserId;
  }

  nextState(state: T) {
    this.stateSubject.next([this.userId, state]);
  }

  async update<TCombine>(
    configureState: (state: T, dependency: TCombine) => T,
    options?: StateUpdateOptions<T, TCombine>,
  ): Promise<T> {
    options = populateOptionsWithDefault(options);
    const current = await firstValueFrom(this.state$.pipe(timeout(options.msTimeout)));
    const combinedDependencies =
      options.combineLatestWith != null
        ? await firstValueFrom(options.combineLatestWith.pipe(timeout(options.msTimeout)))
        : null;
    if (!options.shouldUpdate(current, combinedDependencies)) {
      return current;
    }
    const newState = configureState(current, combinedDependencies);
    this.stateSubject.next([this.userId, newState]);
    this.nextMock([this.userId, newState]);
    return newState;
  }

  updateMock = this.update as jest.MockedFunction<typeof this.update>;

  nextMock = jest.fn<void, [[UserId, T]]>();

  private _keyDefinition: KeyDefinition<T> | null = null;
  get keyDefinition() {
    if (this._keyDefinition == null) {
      throw new Error(
        "Key definition not yet set, usually this means your sut has not asked for this state yet",
      );
    }
    return this._keyDefinition;
  }
  set keyDefinition(value: KeyDefinition<T>) {
    this._keyDefinition = value;
  }
}

export class FakeDerivedState<T> implements DerivedState<T> {
  // eslint-disable-next-line rxjs/no-exposed-subjects -- exposed for testing setup
  stateSubject = new ReplaySubject<T>(1);

  forceValue(value: T): Promise<T> {
    this.stateSubject.next(value);
    return Promise.resolve(value);
  }
  forceValueMock = this.forceValue as jest.MockedFunction<typeof this.forceValue>;

  get state$() {
    return this.stateSubject.asObservable();
  }
}
