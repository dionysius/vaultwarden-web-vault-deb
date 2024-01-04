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

import {
  FakeActiveUserState,
  FakeDerivedState,
  FakeGlobalState,
  FakeSingleUserState,
} from "./fake-state";

export class FakeGlobalStateProvider implements GlobalStateProvider {
  states: Map<string, GlobalState<unknown>> = new Map();
  get<T>(keyDefinition: KeyDefinition<T>): GlobalState<T> {
    let result = this.states.get(keyDefinition.buildCacheKey("global")) as GlobalState<T>;

    if (result == null) {
      result = new FakeGlobalState<T>();
      this.states.set(keyDefinition.buildCacheKey("global"), result);
    }
    return result;
  }

  getFake<T>(keyDefinition: KeyDefinition<T>): FakeGlobalState<T> {
    return this.get(keyDefinition) as FakeGlobalState<T>;
  }
}

export class FakeSingleUserStateProvider implements SingleUserStateProvider {
  states: Map<string, SingleUserState<unknown>> = new Map();
  get<T>(userId: UserId, keyDefinition: KeyDefinition<T>): SingleUserState<T> {
    let result = this.states.get(keyDefinition.buildCacheKey("user", userId)) as SingleUserState<T>;

    if (result == null) {
      result = new FakeSingleUserState<T>(userId);
      this.states.set(keyDefinition.buildCacheKey("user", userId), result);
    }
    return result;
  }

  getFake<T>(userId: UserId, keyDefinition: KeyDefinition<T>): FakeSingleUserState<T> {
    return this.get(userId, keyDefinition) as FakeSingleUserState<T>;
  }
}

export class FakeActiveUserStateProvider implements ActiveUserStateProvider {
  states: Map<string, ActiveUserState<unknown>> = new Map();
  get<T>(keyDefinition: KeyDefinition<T>): ActiveUserState<T> {
    let result = this.states.get(
      keyDefinition.buildCacheKey("user", "active"),
    ) as ActiveUserState<T>;

    if (result == null) {
      result = new FakeActiveUserState<T>();
      this.states.set(keyDefinition.buildCacheKey("user", "active"), result);
    }
    return result;
  }

  getFake<T>(keyDefinition: KeyDefinition<T>): FakeActiveUserState<T> {
    return this.get(keyDefinition) as FakeActiveUserState<T>;
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

  global: FakeGlobalStateProvider = new FakeGlobalStateProvider();
  singleUser: FakeSingleUserStateProvider = new FakeSingleUserStateProvider();
  activeUser: FakeActiveUserStateProvider = new FakeActiveUserStateProvider();
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
