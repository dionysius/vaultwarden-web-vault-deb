import { mock } from "jest-mock-extended";
import { Observable } from "rxjs";

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
    let result = this.states.get(keyDefinition.fullName);

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
      this.states.set(keyDefinition.fullName, result);

      result = new FakeGlobalState<T>();
      this.states.set(keyDefinition.fullName, result);
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
  get<T>(userId: UserId, keyDefinition: KeyDefinition<T>): SingleUserState<T> {
    this.mock.get(userId, keyDefinition);
    let result = this.states.get(`${keyDefinition.fullName}_${userId}`);

    if (result == null) {
      let fake: FakeSingleUserState<T>;
      // Look for established mock
      if (this.establishedMocks.has(keyDefinition.key)) {
        fake = this.establishedMocks.get(keyDefinition.key) as FakeSingleUserState<T>;
      } else {
        fake = new FakeSingleUserState<T>(userId);
      }
      fake.keyDefinition = keyDefinition;
      result = fake;
      this.states.set(`${keyDefinition.fullName}_${userId}`, result);
    }
    return result as SingleUserState<T>;
  }

  getFake<T>(userId: UserId, keyDefinition: KeyDefinition<T>): FakeSingleUserState<T> {
    return this.get(userId, keyDefinition) as FakeSingleUserState<T>;
  }

  mockFor<T>(userId: UserId, keyDefinitionKey: string, initialValue?: T): FakeSingleUserState<T> {
    if (!this.establishedMocks.has(keyDefinitionKey)) {
      this.establishedMocks.set(keyDefinitionKey, new FakeSingleUserState<T>(userId, initialValue));
    }
    return this.establishedMocks.get(keyDefinitionKey) as FakeSingleUserState<T>;
  }
}

export class FakeActiveUserStateProvider implements ActiveUserStateProvider {
  establishedMocks: Map<string, FakeActiveUserState<unknown>> = new Map();

  states: Map<string, FakeActiveUserState<unknown>> = new Map();

  constructor(public accountService: FakeAccountService) {}

  get<T>(keyDefinition: KeyDefinition<T>): ActiveUserState<T> {
    let result = this.states.get(keyDefinition.fullName);

    if (result == null) {
      // Look for established mock
      if (this.establishedMocks.has(keyDefinition.key)) {
        result = this.establishedMocks.get(keyDefinition.key);
      } else {
        result = new FakeActiveUserState<T>(this.accountService);
      }
      result.keyDefinition = keyDefinition;
      this.states.set(keyDefinition.fullName, result);
    }
    return result as ActiveUserState<T>;
  }

  getFake<T>(keyDefinition: KeyDefinition<T>): FakeActiveUserState<T> {
    return this.get(keyDefinition) as FakeActiveUserState<T>;
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
  getActive<T>(keyDefinition: KeyDefinition<T>): ActiveUserState<T> {
    return this.activeUser.get(keyDefinition);
  }

  getGlobal<T>(keyDefinition: KeyDefinition<T>): GlobalState<T> {
    return this.global.get(keyDefinition);
  }

  getUser<T>(userId: UserId, keyDefinition: KeyDefinition<T>): SingleUserState<T> {
    return this.singleUser.get(userId, keyDefinition);
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
      result = new FakeDerivedState<TTo>();
      this.states.set(deriveDefinition.buildCacheKey(), result);
    }
    return result;
  }
}
