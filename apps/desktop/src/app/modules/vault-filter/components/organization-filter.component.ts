import { Component } from "@angular/core";

import { OrganizationFilterComponent as BaseOrganizationFilterComponent } from "@bitwarden/angular/modules/vault-filter/components/organization-filter.component";
import { DisplayMode } from "@bitwarden/angular/modules/vault-filter/models/display-mode";

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
}
