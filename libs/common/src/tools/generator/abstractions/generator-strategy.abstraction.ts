import { PolicyType } from "../../../admin-console/enums";
// FIXME: use index.ts imports once policy abstractions and models
// implement ADR-0002
import { Policy as AdminPolicy } from "../../../admin-console/models/domain/policy";
import { KeyDefinition } from "../../../platform/state";

import { PolicyEvaluator } from "./policy-evaluator.abstraction";

/** Tailors the generator service to generate a specific kind of credentials */
export abstract class GeneratorStrategy<Options, Policy> {
  /** The key used when storing credentials on disk. */
  disk: KeyDefinition<Options>;

  /** Identifies the policy enforced by the generator. */
  policy: PolicyType;

  /** Length of time in milliseconds to cache the evaluator */
  cache_ms: number;

  /** Creates an evaluator from a generator policy.
   * @param policy The policy being evaluated.
   * @returns the policy evaluator.
   * @throws when the policy's type does not match the generator's policy type.
   */
  evaluator: (policy: AdminPolicy) => PolicyEvaluator<Policy, Options>;

  /** Generates credentials from the given options.
   * @param options The options used to generate the credentials.
   * @returns a promise that resolves to the generated credentials.
   */
  generate: (options: Options) => Promise<string>;
}
