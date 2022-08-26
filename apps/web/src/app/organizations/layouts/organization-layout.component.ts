import { Component, NgZone, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { BroadcasterService } from "@bitwarden/common/abstractions/broadcaster.service";
import { OrganizationService } from "@bitwarden/common/abstractions/organization.service";
import { Organization } from "@bitwarden/common/models/domain/organization";

import {
  canAccessManageTab,
  canAccessSettingsTab,
  canAccessToolsTab,
} from "../navigation-permissions";

const BroadcasterSubscriptionId = "OrganizationLayoutComponent";

@Component({
  selector: "app-organization-layout",
  templateUrl: "organization-layout.component.html",
})
export class OrganizationLayoutComponent implements OnInit, OnDestroy {
  organization: Organization;
  businessTokenPromise: Promise<any>;
  private organizationId: string;

  constructor(
    private route: ActivatedRoute,
    private organizationService: OrganizationService,
    private broadcasterService: BroadcasterService,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    document.body.classList.remove("layout_frontend");
    // eslint-disable-next-line rxjs-angular/prefer-takeuntil, rxjs/no-async-subscribe
    this.route.params.subscribe(async (params: any) => {
      this.organizationId = params.organizationId;
      await this.load();
    });
    this.broadcasterService.subscribe(BroadcasterSubscriptionId, (message: any) => {
      this.ngZone.run(async () => {
        switch (message.command) {
          case "updatedOrgLicense":
            await this.load();
            break;
        }
      });
    });
  }

  ngOnDestroy() {
    this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
  }

  async load() {
    this.organization = await this.organizationService.get(this.organizationId);
  }

  get showManageTab(): boolean {
    return canAccessManageTab(this.organization);
  }

  get showToolsTab(): boolean {
    return canAccessToolsTab(this.organization);
  }

  get showSettingsTab(): boolean {
    return canAccessSettingsTab(this.organization);
  }

  get toolsRoute(): string {
    return this.organization.canAccessImportExport
      ? "tools/import"
      : "tools/exposed-passwords-report";
  }

  get manageRoute(): string {
    let route: string;
    switch (true) {
      case this.organization.canManageUsers:
        route = "manage/people";
        break;
      case this.organization.canViewAssignedCollections || this.organization.canViewAllCollections:
        route = "manage/collections";
        break;
      case this.organization.canManageGroups:
        route = "manage/groups";
        break;
      case this.organization.canManagePolicies:
        route = "manage/policies";
        break;
      case this.organization.canManageSso:
        route = "manage/sso";
        break;
      case this.organization.canManageScim:
        route = "manage/scim";
        break;
      case this.organization.canAccessEventLogs:
        route = "manage/events";
        break;
    }
    return route;
  }
}
