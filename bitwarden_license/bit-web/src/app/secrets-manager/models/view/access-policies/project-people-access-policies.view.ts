import { GroupProjectAccessPolicyView, UserProjectAccessPolicyView } from "./access-policy.view";

export class ProjectPeopleAccessPoliciesView {
  userAccessPolicies: UserProjectAccessPolicyView[];
  groupAccessPolicies: GroupProjectAccessPolicyView[];
}
