import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { map, mergeMap, Observable, Subject, takeUntil } from "rxjs";

import {
  canAccessBillingTab,
  canAccessGroupsTab,
  canAccessManageTab,
  canAccessMembersTab,
  canAccessReportingTab,
  canAccessSettingsTab,
  getOrganizationById,
  OrganizationService,
} from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { Organization } from "@bitwarden/common/models/domain/organization";

@Component({
  selector: "app-organization-layout",
  templateUrl: "organization-layout.component.html",
})
export class OrganizationLayoutComponent implements OnInit, OnDestroy {
  organization$: Observable<Organization>;

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

  canShowSettingsTab(organization: Organization): boolean {
    return canAccessSettingsTab(organization);
  }

  canShowManageTab(organization: Organization): boolean {
    return canAccessManageTab(organization);
  }

  canShowMembersTab(organization: Organization): boolean {
    return canAccessMembersTab(organization);
  }

  canShowGroupsTab(organization: Organization): boolean {
    return canAccessGroupsTab(organization);
  }

  canShowReportsTab(organization: Organization): boolean {
    return canAccessReportingTab(organization);
  }

  canShowBillingTab(organization: Organization): boolean {
    return canAccessBillingTab(organization);
  }

  getReportTabLabel(organization: Organization): string {
    return organization.useEvents ? "reporting" : "reports";
  }

  getReportRoute(organization: Organization): string {
    return organization.useEvents ? "reporting/events" : "reporting/reports";
  }

  getManageRoute(organization: Organization): string {
    let route: string;
    switch (true) {
      case organization.canManageUsers:
        route = "manage/members";
        break;
      case organization.canViewAssignedCollections || organization.canViewAllCollections:
        route = "manage/collections";
        break;
      case organization.canManageGroups:
        route = "manage/groups";
        break;
    }
    return route;
  }
}
