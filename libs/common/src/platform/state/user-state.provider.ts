import { Observable } from "rxjs";

import { UserId } from "../../types/guid";

import { KeyDefinition } from "./key-definition";
import { ActiveUserState, SingleUserState } from "./user-state";

/** A provider for getting an implementation of state scoped to a given key and userId */
export abstract class SingleUserStateProvider {
  /**
   * Gets a {@link SingleUserState} scoped to the given {@link KeyDefinition} and {@link UserId}
   *
   * @param userId - The {@link UserId} for which you want the user state for.
   * @param keyDefinition - The {@link KeyDefinition} for which you want the user state for.
   */
  get: <T>(userId: UserId, keyDefinition: KeyDefinition<T>) => SingleUserState<T>;
}

/** A provider for getting an implementation of state scoped to a given key, but always pointing
 * to the currently active user
 */
export abstract class ActiveUserStateProvider {
  /**
   * Convenience re-emission of active user ID from {@link AccountService.activeAccount$}
   */
  activeUserId$: Observable<UserId | undefined>;
  /**
   * Gets a {@link ActiveUserState} scoped to the given {@link KeyDefinition}, but updates when active user changes such
   * that the emitted values always represents the state for the currently active user.
   *
   * @param keyDefinition - The {@link KeyDefinition} for which you want the user state for.
   */
  get: <T>(keyDefinition: KeyDefinition<T>) => ActiveUserState<T>;
}
