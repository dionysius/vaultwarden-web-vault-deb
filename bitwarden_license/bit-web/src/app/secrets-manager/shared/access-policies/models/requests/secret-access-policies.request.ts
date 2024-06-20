import { AccessPolicyRequest } from "./access-policy.request";

export class SecretAccessPoliciesRequest {
  userAccessPolicyRequests: AccessPolicyRequest[];
  groupAccessPolicyRequests: AccessPolicyRequest[];
  serviceAccountAccessPolicyRequests: AccessPolicyRequest[];
}
