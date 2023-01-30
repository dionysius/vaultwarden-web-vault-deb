import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { Organization } from "@bitwarden/common/models/domain/organization";
import { OrganizationPermissionsGuard } from "@bitwarden/web-vault/app/organizations/guards/org-permissions.guard";
import { buildFlaggedRoute } from "@bitwarden/web-vault/app/oss-routing.module";

import { LayoutComponent } from "./layout/layout.component";
import { NavigationComponent } from "./layout/navigation.component";
import { OverviewModule } from "./overview/overview.module";
import { ProjectsModule } from "./projects/projects.module";
import { SecretsModule } from "./secrets/secrets.module";
import { ServiceAccountsModule } from "./service-accounts/service-accounts.module";
import { SMGuard } from "./sm.guard";

const routes: Routes = [
  buildFlaggedRoute("secretsManager", {
    path: ":organizationId",
    component: LayoutComponent,
    canActivate: [OrganizationPermissionsGuard, SMGuard],
    data: {
      organizationPermissions: (org: Organization) => org.canAccessSecretsManager,
    },
    children: [
      {
        path: "",
        component: NavigationComponent,
        outlet: "sidebar",
      },
      {
        path: "secrets",
        loadChildren: () => SecretsModule,
        data: {
          titleId: "secrets",
        },
      },
      {
        path: "projects",
        loadChildren: () => ProjectsModule,
        data: {
          titleId: "projects",
        },
      },
      {
        path: "service-accounts",
        loadChildren: () => ServiceAccountsModule,
        data: {
          titleId: "serviceAccounts",
        },
      },
      {
        path: "",
        loadChildren: () => OverviewModule,
        pathMatch: "full",
      },
    ],
  }),
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SecretsManagerRoutingModule {}
