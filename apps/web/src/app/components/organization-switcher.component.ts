import { Component, Input, OnInit } from "@angular/core";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { OrganizationService } from "@bitwarden/common/abstractions/organization.service";
import { Utils } from "@bitwarden/common/misc/utils";
import { Organization } from "@bitwarden/common/models/domain/organization";

import { canAccessOrgAdmin } from "../organizations/navigation-permissions";

@Component({
  selector: "app-organization-switcher",
  templateUrl: "organization-switcher.component.html",
})
export class OrganizationSwitcherComponent implements OnInit {
  constructor(private organizationService: OrganizationService, private i18nService: I18nService) {}

  @Input() activeOrganization: Organization = null;
  organizations: Organization[] = [];

  loaded = false;

  async ngOnInit() {
    await this.load();
  }

  async load() {
    const orgs = await this.organizationService.getAll();
    this.organizations = orgs
      .filter(canAccessOrgAdmin)
      .sort(Utils.getSortFunction(this.i18nService, "name"));

    this.loaded = true;
  }
}
