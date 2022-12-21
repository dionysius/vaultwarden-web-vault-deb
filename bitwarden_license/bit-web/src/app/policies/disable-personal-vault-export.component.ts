import { Component } from "@angular/core";

import { PolicyType } from "@bitwarden/common/enums/policyType";
import {
  BasePolicy,
  BasePolicyComponent,
} from "@bitwarden/web-vault/app/organizations/policies/base-policy.component";

export class DisablePersonalVaultExportPolicy extends BasePolicy {
  readonly name = "disablePersonalVaultExport";
  readonly description = "disablePersonalVaultExportDesc";
  type = PolicyType.DisablePersonalVaultExport;
  component = DisablePersonalVaultExportPolicyComponent;
}

@Component({
  selector: "policy-disable-personal-vault-export",
  templateUrl: "disable-personal-vault-export.component.html",
})
export class DisablePersonalVaultExportPolicyComponent extends BasePolicyComponent {}
