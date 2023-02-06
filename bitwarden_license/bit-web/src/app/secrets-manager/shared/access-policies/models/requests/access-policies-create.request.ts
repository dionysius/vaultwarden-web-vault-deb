import { AccessPolicyRequest } from "./access-policy.request";

export class AccessPoliciesCreateRequest {
  userAccessPolicyRequests?: AccessPolicyRequest[];
  groupAccessPolicyRequests?: AccessPolicyRequest[];
  serviceAccountAccessPolicyRequests?: AccessPolicyRequest[];
}
