import { ReplaySubject, firstValueFrom, timeout } from "rxjs";

import { DerivedState, GlobalState, SingleUserState, ActiveUserState } from "../src/platform/state";
// eslint-disable-next-line import/no-restricted-paths -- using unexposed options for clean typing in test class
import { StateUpdateOptions } from "../src/platform/state/state-update-options";
// eslint-disable-next-line import/no-restricted-paths -- using unexposed options for clean typing in test class
import { UserState, activeMarker } from "../src/platform/state/user-state";
import { UserId } from "../src/types/guid";

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
    return newState;
  });

  updateMock = this.update as jest.MockedFunction<typeof this.update>;

  get state$() {
    return this.stateSubject.asObservable();
  }
}

export class FakeUserState<T> implements UserState<T> {
  // eslint-disable-next-line rxjs/no-exposed-subjects -- exposed for testing setup
  stateSubject = new ReplaySubject<T>(1);

  update: <TCombine>(
    configureState: (state: T, dependency: TCombine) => T,
    options?: StateUpdateOptions<T, TCombine>,
  ) => Promise<T> = jest.fn(async (configureState, options) => {
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
    this.stateSubject.next(newState);
    return newState;
  });

  updateMock = this.update as jest.MockedFunction<typeof this.update>;

  updateFor: <TCombine>(
    userId: UserId,
    configureState: (state: T, dependency: TCombine) => T,
    options?: StateUpdateOptions<T, TCombine>,
  ) => Promise<T> = jest.fn();

  getFromState: () => Promise<T> = jest.fn(async () => {
    return await firstValueFrom(this.state$.pipe(timeout(10)));
  });

  get state$() {
    return this.stateSubject.asObservable();
  }
}

export class FakeSingleUserState<T> extends FakeUserState<T> implements SingleUserState<T> {
  constructor(readonly userId: UserId) {
    super();
  }
}
export class FakeActiveUserState<T> extends FakeUserState<T> implements ActiveUserState<T> {
  [activeMarker]: true;
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
