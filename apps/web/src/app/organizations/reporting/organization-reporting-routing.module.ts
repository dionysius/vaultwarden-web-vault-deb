import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { canAccessReportingTab } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { Organization } from "@bitwarden/common/models/domain/organization";

import { OrganizationPermissionsGuard } from "../guards/org-permissions.guard";
import { OrganizationRedirectGuard } from "../guards/org-redirect.guard";
import { EventsComponent } from "../manage/events.component";
import { ExposedPasswordsReportComponent } from "../tools/exposed-passwords-report.component";
import { InactiveTwoFactorReportComponent } from "../tools/inactive-two-factor-report.component";
import { ReusedPasswordsReportComponent } from "../tools/reused-passwords-report.component";
import { UnsecuredWebsitesReportComponent } from "../tools/unsecured-websites-report.component";
import { WeakPasswordsReportComponent } from "../tools/weak-passwords-report.component";

import { ReportingComponent } from "./reporting.component";
import { ReportsHomeComponent } from "./reports-home.component";

const routes: Routes = [
  {
    path: "",
    component: ReportingComponent,
    canActivate: [OrganizationPermissionsGuard],
    data: { organizationPermissions: canAccessReportingTab },
    children: [
      {
        path: "",
        pathMatch: "full",
        canActivate: [OrganizationRedirectGuard],
        data: {
          autoRedirectCallback: getReportRoute,
        },
        children: [], // This is required to make the auto redirect work,
      },
      {
        path: "reports",
        component: ReportsHomeComponent,
        canActivate: [OrganizationPermissionsGuard],
        data: {
          titleId: "reports",
        },
        children: [
          {
            path: "exposed-passwords-report",
            component: ExposedPasswordsReportComponent,
            data: {
              titleId: "exposedPasswordsReport",
            },
          },
          {
            path: "inactive-two-factor-report",
            component: InactiveTwoFactorReportComponent,
            data: {
              titleId: "inactive2faReport",
            },
          },
          {
            path: "reused-passwords-report",
            component: ReusedPasswordsReportComponent,
            data: {
              titleId: "reusedPasswordsReport",
            },
          },
          {
            path: "unsecured-websites-report",
            component: UnsecuredWebsitesReportComponent,
            data: {
              titleId: "unsecuredWebsitesReport",
            },
          },
          {
            path: "weak-passwords-report",
            component: WeakPasswordsReportComponent,
            data: {
              titleId: "weakPasswordsReport",
            },
          },
        ],
      },
      {
        path: "events",
        component: EventsComponent,
        canActivate: [OrganizationPermissionsGuard],
        data: {
          titleId: "eventLogs",
          organizationPermissions: (org: Organization) => org.canAccessEventLogs,
        },
      },
    ],
  },
];

function getReportRoute(organization: Organization): string {
  if (organization.canAccessEventLogs) {
    return "events";
  }
  if (organization.canAccessReports) {
    return "reports";
  }
  return undefined;
}

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationReportingRoutingModule {}
