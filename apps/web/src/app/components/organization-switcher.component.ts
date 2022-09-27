import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import {
  canAccessAdmin,
  OrganizationService,
} from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
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
      canAccessAdmin(this.i18nService)
    );

    this.loaded = true;
  }
}
