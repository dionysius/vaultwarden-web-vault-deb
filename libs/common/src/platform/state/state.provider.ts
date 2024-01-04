import { Observable } from "rxjs";

import { UserId } from "../../types/guid";
import { DerivedStateDependencies } from "../../types/state";

import { DeriveDefinition } from "./derive-definition";
import { DerivedState } from "./derived-state";
import { GlobalState } from "./global-state";
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- used in docs
import { GlobalStateProvider } from "./global-state.provider";
import { KeyDefinition } from "./key-definition";
import { ActiveUserState, SingleUserState } from "./user-state";
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- used in docs
import { ActiveUserStateProvider, SingleUserStateProvider } from "./user-state.provider";

/** Convenience wrapper class for {@link ActiveUserStateProvider}, {@link SingleUserStateProvider},
 * and {@link GlobalStateProvider}.
 */
export abstract class StateProvider {
  /** @see{@link ActiveUserStateProvider.get} */
  getActive: <T>(keyDefinition: KeyDefinition<T>) => ActiveUserState<T>;
  /** @see{@link SingleUserStateProvider.get} */
  getUser: <T>(userId: UserId, keyDefinition: KeyDefinition<T>) => SingleUserState<T>;
  /** @see{@link GlobalStateProvider.get} */
  getGlobal: <T>(keyDefinition: KeyDefinition<T>) => GlobalState<T>;
  getDerived: <TFrom, TTo, TDeps extends DerivedStateDependencies>(
    parentState$: Observable<TFrom>,
    deriveDefinition: DeriveDefinition<unknown, TTo, TDeps>,
    dependencies: TDeps,
  ) => DerivedState<TTo>;
}
