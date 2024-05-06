import { ServiceAccountProjectAccessPolicyView } from "./access-policy.view";

export class ServiceAccountGrantedPoliciesView {
  grantedProjectPolicies: ServiceAccountProjectPolicyPermissionDetailsView[];
}

export class ServiceAccountProjectPolicyPermissionDetailsView {
  accessPolicy: ServiceAccountProjectAccessPolicyView;
  hasPermission: boolean;
}
