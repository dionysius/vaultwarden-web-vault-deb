import { Component } from "@angular/core";

import { OrganizationFilterComponent as BaseOrganizationFilterComponent } from "@bitwarden/angular/vault/vault-filter/components/organization-filter.component";
import { DisplayMode } from "@bitwarden/angular/vault/vault-filter/models/display-mode";
import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";

@Component({
  selector: "app-organization-filter",
  templateUrl: "organization-filter.component.html",
})
export class OrganizationFilterComponent extends BaseOrganizationFilterComponent {
  get show() {
    const hiddenDisplayModes: DisplayMode[] = ["singleOrganizationAndPersonalOwnershipPolicies"];
    return (
      !this.hide &&
      this.organizations.length > 0 &&
      hiddenDisplayModes.indexOf(this.displayMode) === -1
    );
  }

  constructor(
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
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
        this.i18nService.t("disabledOrganizationFilterError"),
      );
    }
  }
}
