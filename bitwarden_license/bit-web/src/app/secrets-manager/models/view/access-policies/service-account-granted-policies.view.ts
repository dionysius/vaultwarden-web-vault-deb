import { GrantedProjectAccessPolicyView } from "./access-policy.view";

export class ServiceAccountGrantedPoliciesView {
  grantedProjectPolicies: GrantedProjectPolicyPermissionDetailsView[];
}

export class GrantedProjectPolicyPermissionDetailsView {
  accessPolicy: GrantedProjectAccessPolicyView;
  hasPermission: boolean;
}
