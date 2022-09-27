import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { map, mergeMap, Observable, Subject, takeUntil } from "rxjs";

import {
  OrganizationService,
  getOrganizationById,
  canAccessManageTab,
  canAccessSettingsTab,
  canAccessToolsTab,
} from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { Organization } from "@bitwarden/common/models/domain/organization";

@Component({
  selector: "app-organization-layout",
  templateUrl: "organization-layout.component.html",
})
export class OrganizationLayoutComponent implements OnInit, OnDestroy {
  organization$: Observable<Organization>;
  businessTokenPromise: Promise<void>;

  private _destroy = new Subject<void>();

  constructor(private route: ActivatedRoute, private organizationService: OrganizationService) {}

  ngOnInit() {
    document.body.classList.remove("layout_frontend");

    this.organization$ = this.route.params
      .pipe(takeUntil(this._destroy))
      .pipe<string>(map((p) => p.organizationId))
      .pipe(
        mergeMap((id) => {
          return this.organizationService.organizations$
            .pipe(takeUntil(this._destroy))
            .pipe(getOrganizationById(id));
        })
      );
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
  }

  canShowManageTab(organization: Organization): boolean {
    return canAccessManageTab(organization);
  }

  canShowToolsTab(organization: Organization): boolean {
    return canAccessToolsTab(organization);
  }

  canShowSettingsTab(organization: Organization): boolean {
    return canAccessSettingsTab(organization);
  }

  getToolsRoute(organization: Organization): string {
    return organization.canAccessImportExport ? "tools/import" : "tools/exposed-passwords-report";
  }

  getManageRoute(organization: Organization): string {
    let route: string;
    switch (true) {
      case organization.canManageUsers:
        route = "manage/people";
        break;
      case organization.canViewAssignedCollections || organization.canViewAllCollections:
        route = "manage/collections";
        break;
      case organization.canManageGroups:
        route = "manage/groups";
        break;
      case organization.canManagePolicies:
        route = "manage/policies";
        break;
      case organization.canManageSso:
        route = "manage/sso";
        break;
      case organization.canManageScim:
        route = "manage/scim";
        break;
      case organization.canAccessEventLogs:
        route = "manage/events";
        break;
    }
    return route;
  }
}
