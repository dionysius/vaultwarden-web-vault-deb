import { Component, Input, OnInit } from "@angular/core";
import { map, Observable } from "rxjs";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import {
  canAccessAdmin,
  isNotProviderUser,
  OrganizationService,
} from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { Utils } from "@bitwarden/common/misc/utils";
import { Organization } from "@bitwarden/common/models/domain/organization";

@Component({
  selector: "app-organization-switcher",
  templateUrl: "organization-switcher.component.html",
})
export class OrganizationSwitcherComponent implements OnInit {
  constructor(private organizationService: OrganizationService, private i18nService: I18nService) {}

  @Input() activeOrganization: Organization = null;
  organizations$: Observable<Organization[]>;

  loaded = false;

  async ngOnInit() {
    this.organizations$ = this.organizationService.organizations$.pipe(
      map((orgs) => orgs.filter(isNotProviderUser)),
      canAccessAdmin(this.i18nService),
      map((orgs) => orgs.sort(Utils.getSortFunction(this.i18nService, "name")))
    );

    this.loaded = true;
  }
}
