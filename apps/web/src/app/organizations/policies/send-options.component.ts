import { Component } from "@angular/core";
import { UntypedFormBuilder } from "@angular/forms";

import { PolicyType } from "@bitwarden/common/enums/policyType";

import { BasePolicy, BasePolicyComponent } from "./base-policy.component";

export class SendOptionsPolicy extends BasePolicy {
  readonly name = "sendOptions";
  readonly description = "sendOptionsPolicyDesc";
  type = PolicyType.SendOptions;
  component = SendOptionsPolicyComponent;
}

@Component({
  selector: "policy-send-options",
  templateUrl: "send-options.component.html",
})
export class SendOptionsPolicyComponent extends BasePolicyComponent {
  data = this.formBuilder.group({
    disableHideEmail: false,
  });

  constructor(private formBuilder: UntypedFormBuilder) {
    super();
  }
}
