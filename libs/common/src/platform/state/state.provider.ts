import { Observable } from "rxjs";

import { UserId } from "../../types/guid";
import { DerivedStateDependencies } from "../../types/state";

import { DeriveDefinition } from "./derive-definition";
import { DerivedState } from "./derived-state";
import { GlobalState } from "./global-state";
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- used in docs
import { GlobalStateProvider } from "./global-state.provider";
import { KeyDefinition } from "./key-definition";
import { UserKeyDefinition } from "./user-key-definition";
import { ActiveUserState, SingleUserState } from "./user-state";
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- used in docs
import { ActiveUserStateProvider, SingleUserStateProvider } from "./user-state.provider";

/** Convenience wrapper class for {@link ActiveUserStateProvider}, {@link SingleUserStateProvider},
 * and {@link GlobalStateProvider}.
 */
export abstract class StateProvider {
  /** @see{@link ActiveUserState.activeUserId$} */
  activeUserId$: Observable<UserId | undefined>;
  /**
   * Gets a state observable for a given key and userId.
   *
   * @remarks If userId is falsy the observable returned will point to the currently active user _and not update if the active user changes_.
   * This is different to how `getActive` works and more similar to `getUser` for whatever user happens to be active at the time of the call.
   *
   * @param keyDefinition - The key definition for the state you want to get.
   * @param userId - The userId for which you want the state for. If not provided, the state for the currently active user will be returned.
   */
  getUserState$: <T>(keyDefinition: KeyDefinition<T>, userId?: UserId) => Observable<T>;

  /**
   * Sets the state for a given key and userId.
   *
   * @overload
   * @param keyDefinition - The key definition for the state you want to set.
   * @param value - The value to set the state to.
   * @param userId - The userId for which you want to set the state for. If not provided, the state for the currently active user will be set.
   */
  abstract setUserState<T>(
    keyDefinition: UserKeyDefinition<T>,
    value: T,
    userId?: UserId,
  ): Promise<[UserId, T]>;

  /**
   * Sets the state for a given key and userId.
   *
   * **NOTE** Consider converting your {@link KeyDefinition} to a {@link UserKeyDefinition} for additional features.
   *
   * @overload
   * @param keyDefinition - The key definition for the state you want to set.
   * @param value - The value to set the state to.
   * @param userId - The userId for which you want to set the state for. If not provided, the state for the currently active user will be set.
   */
  abstract setUserState<T>(
    keyDefinition: KeyDefinition<T>,
    value: T,
    userId?: UserId,
  ): Promise<[UserId, T]>;

  abstract setUserState<T>(
    keyDefinition: KeyDefinition<T> | UserKeyDefinition<T>,
    value: T,
    userId?: UserId,
  ): Promise<[UserId, T]>;

  /** @see{@link ActiveUserStateProvider.get} */
  abstract getActive<T>(keyDefinition: UserKeyDefinition<T>): ActiveUserState<T>;

  /**
   * @see{@link ActiveUserStateProvider.get}
   *
   * **NOTE** Consider converting your {@link KeyDefinition} to a {@link UserKeyDefinition} for additional features.
   */
  abstract getActive<T>(keyDefinition: KeyDefinition<T>): ActiveUserState<T>;

  /** @see{@link ActiveUserStateProvider.get} */
  abstract getActive<T>(keyDefinition: KeyDefinition<T> | UserKeyDefinition<T>): ActiveUserState<T>;

  /** @see{@link SingleUserStateProvider.get} */
  abstract getUser<T>(userId: UserId, keyDefinition: UserKeyDefinition<T>): SingleUserState<T>;

  /**
   * @see{@link SingleUserStateProvider.get}
   *
   * **NOTE** Consider converting your {@link KeyDefinition} to a {@link UserKeyDefinition} for additional features.
   */
  abstract getUser<T>(userId: UserId, keyDefinition: KeyDefinition<T>): SingleUserState<T>;

  /** @see{@link SingleUserStateProvider.get} */
  abstract getUser<T>(
    userId: UserId,
    keyDefinition: KeyDefinition<T> | UserKeyDefinition<T>,
  ): SingleUserState<T>;

  /** @see{@link GlobalStateProvider.get} */
  getGlobal: <T>(keyDefinition: KeyDefinition<T>) => GlobalState<T>;
  getDerived: <TFrom, TTo, TDeps extends DerivedStateDependencies>(
    parentState$: Observable<TFrom>,
    deriveDefinition: DeriveDefinition<TFrom, TTo, TDeps>,
    dependencies: TDeps,
  ) => DerivedState<TTo>;
}
