import { Component } from "@angular/core";

import { PolicyType } from "@bitwarden/common/enums/policyType";
import { Organization } from "@bitwarden/common/models/domain/organization";
import {
  BasePolicy,
  BasePolicyComponent,
} from "@bitwarden/web-vault/app/organizations/policies/base-policy.component";

export class ActivateAutofillPolicy extends BasePolicy {
  name = "activateAutofill";
  description = "activateAutofillDesc";
  type = PolicyType.ActivateAutofill;
  component = ActivateAutofillPolicyComponent;

  display(organization: Organization) {
    return organization.useActivateAutofillPolicy;
  }
}

@Component({
  selector: "policy-activate-autofill",
  templateUrl: "activate-autofill.component.html",
})
export class ActivateAutofillPolicyComponent extends BasePolicyComponent {}
