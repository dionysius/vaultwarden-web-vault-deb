import { Component, Input, OnInit } from "@angular/core";
import { map, Observable } from "rxjs";

import {
  canAccessAdmin,
  OrganizationService,
} from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";

@Component({
  selector: "app-organization-switcher",
  templateUrl: "organization-switcher.component.html",
})
export class OrganizationSwitcherComponent implements OnInit {
  constructor(
    private organizationService: OrganizationService,
    private i18nService: I18nService,
  ) {}

  @Input() activeOrganization: Organization = null;
  organizations$: Observable<Organization[]>;

  loaded = false;

  async ngOnInit() {
    this.organizations$ = this.organizationService.memberOrganizations$.pipe(
      canAccessAdmin(this.i18nService),
      map((orgs) => orgs.sort(Utils.getSortFunction(this.i18nService, "name"))),
    );

    this.loaded = true;
  }
}
