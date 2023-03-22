import { Component } from "@angular/core";

import { PolicyType } from "@bitwarden/common/admin-console/enums/policy-type";

import { BasePolicy, BasePolicyComponent } from "./base-policy.component";

export class DisableSendPolicy extends BasePolicy {
  name = "disableSend";
  description = "disableSendPolicyDesc";
  type = PolicyType.DisableSend;
  component = DisableSendPolicyComponent;
}

@Component({
  selector: "policy-disable-send",
  templateUrl: "disable-send.component.html",
})
export class DisableSendPolicyComponent extends BasePolicyComponent {}
