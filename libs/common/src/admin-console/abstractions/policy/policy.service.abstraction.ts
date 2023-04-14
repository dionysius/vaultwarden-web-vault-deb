import { Observable } from "rxjs";

import { ListResponse } from "../../../models/response/list.response";
import { PolicyType } from "../../enums";
import { PolicyData } from "../../models/data/policy.data";
import { MasterPasswordPolicyOptions } from "../../models/domain/master-password-policy-options";
import { Policy } from "../../models/domain/policy";
import { ResetPasswordPolicyOptions } from "../../models/domain/reset-password-policy-options";
import { PolicyResponse } from "../../models/response/policy.response";

export abstract class PolicyService {
  policies$: Observable<Policy[]>;
  get$: (policyType: PolicyType, policyFilter?: (policy: Policy) => boolean) => Observable<Policy>;
  masterPasswordPolicyOptions$: (policies?: Policy[]) => Observable<MasterPasswordPolicyOptions>;
  policyAppliesToActiveUser$: (
    policyType: PolicyType,
    policyFilter?: (policy: Policy) => boolean
  ) => Observable<boolean>;

  /**
   * @deprecated Do not call this, use the policies$ observable collection
   */
  getAll: (type?: PolicyType, userId?: string) => Promise<Policy[]>;
  evaluateMasterPassword: (
    passwordStrength: number,
    newPassword: string,
    enforcedPolicyOptions?: MasterPasswordPolicyOptions
  ) => boolean;
  getResetPasswordPolicyOptions: (
    policies: Policy[],
    orgId: string
  ) => [ResetPasswordPolicyOptions, boolean];
  mapPoliciesFromToken: (policiesResponse: ListResponse<PolicyResponse>) => Policy[];
  policyAppliesToUser: (
    policyType: PolicyType,
    policyFilter?: (policy: Policy) => boolean,
    userId?: string
  ) => Promise<boolean>;
}

export abstract class InternalPolicyService extends PolicyService {
  upsert: (policy: PolicyData) => Promise<any>;
  replace: (policies: { [id: string]: PolicyData }) => Promise<void>;
  clear: (userId?: string) => Promise<any>;
}
