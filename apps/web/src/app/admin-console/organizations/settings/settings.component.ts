import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable, switchMap } from "rxjs";

import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";

@Component({
  selector: "app-org-settings",
  templateUrl: "settings.component.html",
})
export class SettingsComponent implements OnInit {
  organization$: Observable<Organization>;
  FeatureFlag = FeatureFlag;

  constructor(
    private route: ActivatedRoute,
    private organizationService: OrganizationService,
  ) {}

  ngOnInit() {
    this.organization$ = this.route.params.pipe(
      switchMap((params) => this.organizationService.get$(params.organizationId)),
    );
  }
}
