import { Observable } from "rxjs";

import { UserId } from "../../types/guid";
import { EncryptService } from "../abstractions/encrypt.service";
import { UserKey } from "../models/domain/symmetric-crypto-key";

import { StateUpdateOptions } from "./state-update-options";

import { DerivedUserState } from ".";

export class DeriveContext {
  constructor(readonly activeUserKey: UserKey, readonly encryptService: EncryptService) {}
}

export type Converter<TFrom, TTo> = (data: TFrom, context: DeriveContext) => Promise<TTo>;

/**
 * A helper object for interacting with state that is scoped to a specific user.
 */
export interface UserState<T> {
  readonly state$: Observable<T>;
  readonly getFromState: () => Promise<T>;
  /**
   * Updates backing stores for the active user.
   * @param configureState function that takes the current state and returns the new state
   * @param options Defaults to @see {module:state-update-options#DEFAULT_OPTIONS}
   * @param options.shouldUpdate A callback for determining if you want to update state. Defaults to () => true
   * @param options.combineLatestWith An observable that you want to combine with the current state for callbacks. Defaults to null
   * @param options.msTimeout A timeout for how long you are willing to wait for a `combineLatestWith` option to complete. Defaults to 1000ms. Only applies if `combineLatestWith` is set.

   * @returns The new state
   */
  readonly update: <TCombine>(
    configureState: (state: T, dependencies: TCombine) => T,
    options?: StateUpdateOptions<T, TCombine>
  ) => Promise<T>;
  /**
   * Updates backing stores for the given userId, which may or may not be active.
   * @param userId the UserId to target the update for
   * @param configureState function that takes the current state for the targeted user and returns the new state
   * @param options Defaults given by @see {module:state-update-options#DEFAULT_OPTIONS}
   * @param options.shouldUpdate A callback for determining if you want to update state. Defaults to () => true
   * @param options.combineLatestWith An observable that you want to combine with the current state for callbacks. Defaults to null
   * @param options.msTimeout A timeout for how long you are willing to wait for a `combineLatestWith` option to complete. Defaults to 1000ms. Only applies if `combineLatestWith` is set.

   * @returns The new state
   */
  readonly updateFor: <TCombine>(
    userId: UserId,
    configureState: (state: T, dependencies: TCombine) => T,
    options?: StateUpdateOptions<T, TCombine>
  ) => Promise<T>;

  /**
   * Creates a derives state from the current state. Derived states are always tied to the active user.
   * @param converter
   * @returns
   */
  createDerived: <TTo>(converter: Converter<T, TTo>) => DerivedUserState<TTo>;
}
