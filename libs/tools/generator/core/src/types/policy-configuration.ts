import { PolicyType } from "@bitwarden/common/admin-console/enums";
import { Policy as AdminPolicy } from "@bitwarden/common/admin-console/models/domain/policy";
import { Constraints } from "@bitwarden/common/tools/types";

import { PolicyEvaluator } from "../abstractions";

/** Determines how to construct a password generator policy */
export type PolicyConfiguration<Policy, Settings> = {
  type: PolicyType;

  /** The value of the policy when it is not in effect. */
  disabledValue: Policy;

  /** Combines multiple policies set by the administrative console into
   *  a single policy.
   */
  combine: (acc: Policy, policy: AdminPolicy) => Policy;

  /** Converts policy service data into an actionable policy.
   */
  createEvaluator: (policy: Policy) => PolicyEvaluator<Policy, Settings>;

  /** Converts policy service data into an actionable policy.
   * @remarks this version includes constraints needed for the reactive forms;
   *  it was introduced so that the constraints can be incrementally introduced
   *  as the new UI is built.
   */
  createEvaluatorV2?: (policy: Policy) => PolicyEvaluator<Policy, Settings> & Constraints<Settings>;
};
