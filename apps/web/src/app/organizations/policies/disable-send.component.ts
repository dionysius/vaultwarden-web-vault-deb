import { Component } from "@angular/core";

import { PolicyType } from "@bitwarden/common/enums/policyType";

import { BasePolicy, BasePolicyComponent } from "./base-policy.component";

export class DisableSendPolicy extends BasePolicy {
  readonly name = "disableSend";
  readonly description = "disableSendPolicyDesc";
  type = PolicyType.DisableSend;
  component = DisableSendPolicyComponent;
}

@Component({
  selector: "policy-disable-send",
  templateUrl: "disable-send.component.html",
})
export class DisableSendPolicyComponent extends BasePolicyComponent {}
