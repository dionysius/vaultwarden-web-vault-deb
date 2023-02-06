import {
  GroupProjectAccessPolicyView,
  ServiceAccountProjectAccessPolicyView,
  UserProjectAccessPolicyView,
} from "./access-policy.view";

export class ProjectAccessPoliciesView {
  userAccessPolicies: UserProjectAccessPolicyView[];
  groupAccessPolicies: GroupProjectAccessPolicyView[];
  serviceAccountAccessPolicies: ServiceAccountProjectAccessPolicyView[];
}
