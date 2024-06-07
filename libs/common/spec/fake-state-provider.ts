import { mock } from "jest-mock-extended";
import { Observable, map, of, switchMap, take } from "rxjs";

import {
  GlobalState,
  GlobalStateProvider,
  KeyDefinition,
  ActiveUserState,
  SingleUserState,
  SingleUserStateProvider,
  StateProvider,
  ActiveUserStateProvider,
  DerivedState,
  DeriveDefinition,
  DerivedStateProvider,
  UserKeyDefinition,
} from "../src/platform/state";
import { UserId } from "../src/types/guid";
import { DerivedStateDependencies } from "../src/types/state";

import { FakeAccountService } from "./fake-account-service";
import {
  FakeActiveUserState,
  FakeDerivedState,
  FakeGlobalState,
  FakeSingleUserState,
} from "./fake-state";

export class FakeGlobalStateProvider implements GlobalStateProvider {
  mock = mock<GlobalStateProvider>();
  establishedMocks: Map<string, FakeGlobalState<unknown>> = new Map();
  states: Map<string, GlobalState<unknown>> = new Map();
  get<T>(keyDefinition: KeyDefinition<T>): GlobalState<T> {
    this.mock.get(keyDefinition);
    const cacheKey = `${keyDefinition.fullName}_${keyDefinition.stateDefinition.defaultStorageLocation}`;
    let result = this.states.get(cacheKey);

    if (result == null) {
      let fake: FakeGlobalState<T>;
      // Look for established mock
      if (this.establishedMocks.has(keyDefinition.key)) {
        fake = this.establishedMocks.get(keyDefinition.key) as FakeGlobalState<T>;
      } else {
        fake = new FakeGlobalState<T>();
      }
      fake.keyDefinition = keyDefinition;
      result = fake;
      this.states.set(cacheKey, result);

      result = new FakeGlobalState<T>();
      this.states.set(cacheKey, result);
    }
    return result as GlobalState<T>;
  }

  getFake<T>(keyDefinition: KeyDefinition<T>): FakeGlobalState<T> {
    return this.get(keyDefinition) as FakeGlobalState<T>;
  }

  mockFor<T>(keyDefinitionKey: string, initialValue?: T): FakeGlobalState<T> {
    if (!this.establishedMocks.has(keyDefinitionKey)) {
      this.establishedMocks.set(keyDefinitionKey, new FakeGlobalState<T>(initialValue));
    }
    return this.establishedMocks.get(keyDefinitionKey) as FakeGlobalState<T>;
  }
}

export class FakeSingleUserStateProvider implements SingleUserStateProvider {
  mock = mock<SingleUserStateProvider>();
  establishedMocks: Map<string, FakeSingleUserState<unknown>> = new Map();
  states: Map<string, SingleUserState<unknown>> = new Map();
  get<T>(userId: UserId, userKeyDefinition: UserKeyDefinition<T>): SingleUserState<T> {
    this.mock.get(userId, userKeyDefinition);
    const cacheKey = `${userKeyDefinition.fullName}_${userKeyDefinition.stateDefinition.defaultStorageLocation}_${userId}`;
    let result = this.states.get(cacheKey);

    if (result == null) {
      let fake: FakeSingleUserState<T>;
      // Look for established mock
      if (this.establishedMocks.has(userKeyDefinition.key)) {
        fake = this.establishedMocks.get(userKeyDefinition.key) as FakeSingleUserState<T>;
      } else {
        fake = new FakeSingleUserState<T>(userId);
      }
      fake.keyDefinition = userKeyDefinition;
      result = fake;
      this.states.set(cacheKey, result);
    }
    return result as SingleUserState<T>;
  }

  getFake<T>(userId: UserId, userKeyDefinition: UserKeyDefinition<T>): FakeSingleUserState<T> {
    return this.get(userId, userKeyDefinition) as FakeSingleUserState<T>;
  }

  mockFor<T>(userId: UserId, keyDefinitionKey: string, initialValue?: T): FakeSingleUserState<T> {
    if (!this.establishedMocks.has(keyDefinitionKey)) {
      this.establishedMocks.set(keyDefinitionKey, new FakeSingleUserState<T>(userId, initialValue));
    }
    return this.establishedMocks.get(keyDefinitionKey) as FakeSingleUserState<T>;
  }
}

export class FakeActiveUserStateProvider implements ActiveUserStateProvider {
  activeUserId$: Observable<UserId>;
  establishedMocks: Map<string, FakeActiveUserState<unknown>> = new Map();

  states: Map<string, FakeActiveUserState<unknown>> = new Map();

  constructor(public accountService: FakeAccountService) {
    this.activeUserId$ = accountService.activeAccountSubject.asObservable().pipe(map((a) => a?.id));
  }

  get<T>(userKeyDefinition: UserKeyDefinition<T>): ActiveUserState<T> {
    const cacheKey = `${userKeyDefinition.fullName}_${userKeyDefinition.stateDefinition.defaultStorageLocation}`;
    let result = this.states.get(cacheKey);

    if (result == null) {
      // Look for established mock
      if (this.establishedMocks.has(userKeyDefinition.key)) {
        result = this.establishedMocks.get(userKeyDefinition.key);
      } else {
        result = new FakeActiveUserState<T>(this.accountService);
      }
      result.keyDefinition = userKeyDefinition;
      this.states.set(cacheKey, result);
    }
    return result as ActiveUserState<T>;
  }

  getFake<T>(userKeyDefinition: UserKeyDefinition<T>): FakeActiveUserState<T> {
    return this.get(userKeyDefinition) as FakeActiveUserState<T>;
  }

  mockFor<T>(keyDefinitionKey: string, initialValue?: T): FakeActiveUserState<T> {
    if (!this.establishedMocks.has(keyDefinitionKey)) {
      this.establishedMocks.set(
        keyDefinitionKey,
        new FakeActiveUserState<T>(this.accountService, initialValue),
      );
    }
    return this.establishedMocks.get(keyDefinitionKey) as FakeActiveUserState<T>;
  }
}

export class FakeStateProvider implements StateProvider {
  mock = mock<StateProvider>();
  getUserState$<T>(userKeyDefinition: UserKeyDefinition<T>, userId?: UserId): Observable<T> {
    this.mock.getUserState$(userKeyDefinition, userId);
    if (userId) {
      return this.getUser<T>(userId, userKeyDefinition).state$;
    }

    return this.getActive(userKeyDefinition).state$;
  }

  getUserStateOrDefault$<T>(
    userKeyDefinition: UserKeyDefinition<T>,
    config: { userId: UserId | undefined; defaultValue?: T },
  ): Observable<T> {
    const { userId, defaultValue = null } = config;
    this.mock.getUserStateOrDefault$(userKeyDefinition, config);
    if (userId) {
      return this.getUser<T>(userId, userKeyDefinition).state$;
    }

    return this.activeUserId$.pipe(
      take(1),
      switchMap((userId) =>
        userId != null ? this.getUser(userId, userKeyDefinition).state$ : of(defaultValue),
      ),
    );
  }

  async setUserState<T>(
    userKeyDefinition: UserKeyDefinition<T>,
    value: T,
    userId?: UserId,
  ): Promise<[UserId, T]> {
    await this.mock.setUserState(userKeyDefinition, value, userId);
    if (userId) {
      return [userId, await this.getUser(userId, userKeyDefinition).update(() => value)];
    } else {
      return await this.getActive(userKeyDefinition).update(() => value);
    }
  }

  getActive<T>(userKeyDefinition: UserKeyDefinition<T>): ActiveUserState<T> {
    return this.activeUser.get(userKeyDefinition);
  }

  getGlobal<T>(keyDefinition: KeyDefinition<T>): GlobalState<T> {
    return this.global.get(keyDefinition);
  }

  getUser<T>(userId: UserId, userKeyDefinition: UserKeyDefinition<T>): SingleUserState<T> {
    return this.singleUser.get(userId, userKeyDefinition);
  }

  getDerived<TFrom, TTo, TDeps extends DerivedStateDependencies>(
    parentState$: Observable<TFrom>,
    deriveDefinition: DeriveDefinition<unknown, TTo, TDeps>,
    dependencies: TDeps,
  ): DerivedState<TTo> {
    return this.derived.get(parentState$, deriveDefinition, dependencies);
  }

  constructor(public accountService: FakeAccountService) {}

  global: FakeGlobalStateProvider = new FakeGlobalStateProvider();
  singleUser: FakeSingleUserStateProvider = new FakeSingleUserStateProvider();
  activeUser: FakeActiveUserStateProvider = new FakeActiveUserStateProvider(this.accountService);
  derived: FakeDerivedStateProvider = new FakeDerivedStateProvider();
  activeUserId$: Observable<UserId> = this.activeUser.activeUserId$;
}

export class FakeDerivedStateProvider implements DerivedStateProvider {
  states: Map<string, DerivedState<unknown>> = new Map();
  get<TFrom, TTo, TDeps extends DerivedStateDependencies>(
    parentState$: Observable<TFrom>,
    deriveDefinition: DeriveDefinition<TFrom, TTo, TDeps>,
    dependencies: TDeps,
  ): DerivedState<TTo> {
    let result = this.states.get(deriveDefinition.buildCacheKey()) as DerivedState<TTo>;

    if (result == null) {
      result = new FakeDerivedState(parentState$, deriveDefinition, dependencies);
      this.states.set(deriveDefinition.buildCacheKey(), result);
    }
    return result;
  }
}
