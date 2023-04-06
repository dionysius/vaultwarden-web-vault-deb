import { PolicyType } from "../../enums";

export class PolicyRequest {
  type: PolicyType;
  enabled: boolean;
  data: any;
}
