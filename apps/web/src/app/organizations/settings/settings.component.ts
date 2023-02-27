import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable, switchMap } from "rxjs";

import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { Organization } from "@bitwarden/common/models/domain/organization";

@Component({
  selector: "app-org-settings",
  templateUrl: "settings.component.html",
})
export class SettingsComponent implements OnInit {
  organization$: Observable<Organization>;

  constructor(private route: ActivatedRoute, private organizationService: OrganizationService) {}

  ngOnInit() {
    this.organization$ = this.route.params.pipe(
      switchMap((params) => this.organizationService.get$(params.organizationId))
    );
  }
}
