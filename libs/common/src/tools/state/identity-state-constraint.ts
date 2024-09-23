import { Constraints, StateConstraints } from "../types";

// The constraints type shares the properties of the state,
// but never has any members
const EMPTY_CONSTRAINTS = new Proxy<any>(Object.freeze({}), {
  get() {
    return {};
  },
});

/** A constraint that does nothing. */
export class IdentityConstraint<State extends object> implements StateConstraints<State> {
  /** Instantiate the identity constraint */
  constructor() {}

  readonly constraints: Readonly<Constraints<State>> = EMPTY_CONSTRAINTS;

  adjust(state: State) {
    return state;
  }
  fix(state: State) {
    return state;
  }
}
