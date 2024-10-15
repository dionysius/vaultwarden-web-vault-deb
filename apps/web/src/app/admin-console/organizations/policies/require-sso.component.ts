import { Component } from "@angular/core";

import { PolicyType } from "@bitwarden/common/admin-console/enums";
import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { PolicyRequest } from "@bitwarden/common/admin-console/models/request/policy.request";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";

import { BasePolicy, BasePolicyComponent } from "./base-policy.component";

export class RequireSsoPolicy extends BasePolicy {
  name = "requireSso";
  description = "requireSsoPolicyDesc";
  type = PolicyType.RequireSso;
  component = RequireSsoPolicyComponent;

  display(organization: Organization) {
    return organization.useSso;
  }
}

@Component({
  selector: "policy-require-sso",
  templateUrl: "require-sso.component.html",
})
export class RequireSsoPolicyComponent extends BasePolicyComponent {
  constructor(
    private i18nService: I18nService,
    private configService: ConfigService,
  ) {
    super();
  }

  async buildRequest(policiesEnabledMap: Map<PolicyType, boolean>): Promise<PolicyRequest> {
    if (await this.configService.getFeatureFlag(FeatureFlag.Pm13322AddPolicyDefinitions)) {
      // We are now relying on server-side validation only
      return super.buildRequest(policiesEnabledMap);
    }

    const singleOrgEnabled = policiesEnabledMap.get(PolicyType.SingleOrg) ?? false;
    if (this.enabled.value && !singleOrgEnabled) {
      throw new Error(this.i18nService.t("requireSsoPolicyReqError"));
    }

    return super.buildRequest(policiesEnabledMap);
  }
}
