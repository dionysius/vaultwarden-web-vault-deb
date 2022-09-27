import { Component } from "@angular/core";
import { UntypedFormBuilder } from "@angular/forms";

import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { PolicyType } from "@bitwarden/common/enums/policyType";
import { Organization } from "@bitwarden/common/models/domain/organization";

import { BasePolicy, BasePolicyComponent } from "./base-policy.component";

export class ResetPasswordPolicy extends BasePolicy {
  name = "resetPasswordPolicy";
  description = "resetPasswordPolicyDescription";
  type = PolicyType.ResetPassword;
  component = ResetPasswordPolicyComponent;

  display(organization: Organization) {
    return organization.useResetPassword;
  }
}

@Component({
  selector: "policy-reset-password",
  templateUrl: "reset-password.component.html",
})
export class ResetPasswordPolicyComponent extends BasePolicyComponent {
  data = this.formBuilder.group({
    autoEnrollEnabled: false,
  });

  defaultTypes: { name: string; value: string }[];
  showKeyConnectorInfo = false;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private organizationService: OrganizationService
  ) {
    super();
  }

  async ngOnInit() {
    super.ngOnInit();
    const organization = await this.organizationService.get(this.policyResponse.organizationId);
    this.showKeyConnectorInfo = organization.keyConnectorEnabled;
  }
}
