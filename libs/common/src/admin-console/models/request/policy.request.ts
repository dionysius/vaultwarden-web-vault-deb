import { PolicyType } from "../../enums/policy-type";

export class PolicyRequest {
  type: PolicyType;
  enabled: boolean;
  data: any;
}
