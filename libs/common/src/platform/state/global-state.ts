import { Observable } from "rxjs";

/**
 * A helper object for interacting with state that is scoped to a specific domain
 * but is not scoped to a user. This is application wide storage.
 */
export interface GlobalState<T> {
  /**
   * Method for allowing you to manipulate state in an additive way.
   * @param configureState callback for how you want manipulate this section of state
   * @returns A promise that must be awaited before your next action to ensure the update has been written to state.
   */
  update: (configureState: (state: T) => T) => Promise<T>;

  /**
   * An observable stream of this state, the first emission of this will be the current state on disk
   * and subsequent updates will be from an update to that state.
   */
  state$: Observable<T>;
}
