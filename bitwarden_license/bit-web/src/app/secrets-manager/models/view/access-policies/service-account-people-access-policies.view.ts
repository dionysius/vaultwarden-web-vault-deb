import {
  GroupServiceAccountAccessPolicyView,
  UserServiceAccountAccessPolicyView,
} from "./access-policy.view";

export class ServiceAccountPeopleAccessPoliciesView {
  userAccessPolicies: UserServiceAccountAccessPolicyView[];
  groupAccessPolicies: GroupServiceAccountAccessPolicyView[];
}
