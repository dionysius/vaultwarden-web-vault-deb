import {
  GroupAccessPolicyView,
  UserAccessPolicyView,
  ServiceAccountAccessPolicyView,
} from "./access-policy.view";

export class SecretAccessPoliciesView {
  userAccessPolicies: UserAccessPolicyView[];
  groupAccessPolicies: GroupAccessPolicyView[];
  serviceAccountAccessPolicies: ServiceAccountAccessPolicyView[];
}
