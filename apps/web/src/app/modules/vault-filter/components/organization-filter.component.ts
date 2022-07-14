import { Component } from "@angular/core";

import { OrganizationFilterComponent as BaseOrganizationFilterComponent } from "@bitwarden/angular/modules/vault-filter/components/organization-filter.component";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { Organization } from "@bitwarden/common/models/domain/organization";

@Component({
  selector: "app-organization-filter",
  templateUrl: "organization-filter.component.html",
})
export class OrganizationFilterComponent extends BaseOrganizationFilterComponent {
  displayText = "allVaults";

  constructor(
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService
  ) {
    super();
  }

  async applyOrganizationFilter(organization: Organization) {
    if (organization.enabled) {
      //proceed with default behaviour for enabled organizations
      super.applyOrganizationFilter(organization);
    } else {
      this.platformUtilsService.showToast(
        "error",
        null,
        this.i18nService.t("disabledOrganizationFilterError")
      );
    }
  }
}
