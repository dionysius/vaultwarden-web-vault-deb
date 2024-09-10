import { Simplify } from "type-fest";

/** Constraints that are shared by all primitive field types */
type PrimitiveConstraint = {
  /** presence indicates the field is required */
  required?: true;
};

/** Constraints that are shared by string fields */
type StringConstraints = {
  /** minimum string length. When absent, min length is 0. */
  minLength?: number;

  /** maximum string length. When absent, max length is unbounded. */
  maxLength?: number;
};

/** Constraints that are shared by number fields */
type NumberConstraints = {
  /** minimum number value. When absent, min value is unbounded. */
  min?: number;

  /** maximum number value. When absent, min value is unbounded. */
  max?: number;

  /** presence indicates the field only accepts integer values */
  integer?: true;

  /** requires the number be a multiple of the step value */
  step?: number;
};

/** Utility type that transforms keys of T into their supported
 *  validators.
 */
export type Constraints<T> = {
  [Key in keyof T]: Simplify<
    PrimitiveConstraint &
      (T[Key] extends string
        ? StringConstraints
        : T[Key] extends number
          ? NumberConstraints
          : never)
  >;
};

/** utility type for methods that evaluate constraints generically. */
export type AnyConstraint = PrimitiveConstraint & StringConstraints & NumberConstraints;

/** Options that provide contextual information about the application state
 *  when a generator is invoked.
 */
export type VaultItemRequest = {
  /** The domain of the website the requested credential is used
   *  within. This should be set to `null` when the request is not specific
   *  to any website.
   *  @remarks this field contains sensitive data
   */
  website: string | null;
};

/** Options that provide contextual information about the application state
 *  when a generator is invoked.
 */
export type GenerationRequest = Partial<VaultItemRequest>;
