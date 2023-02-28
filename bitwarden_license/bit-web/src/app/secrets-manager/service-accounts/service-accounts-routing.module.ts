import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AccessTokenComponent } from "./access/access-tokens.component";
import { ServiceAccountPeopleComponent } from "./people/service-account-people.component";
import { ServiceAccountProjectsComponent } from "./projects/service-account-projects.component";
import { ServiceAccountComponent } from "./service-account.component";
import { ServiceAccountsComponent } from "./service-accounts.component";

const routes: Routes = [
  {
    path: "",
    component: ServiceAccountsComponent,
  },
  {
    path: ":serviceAccountId",
    component: ServiceAccountComponent,
    children: [
      {
        path: "",
        pathMatch: "full",
        redirectTo: "projects",
      },
      {
        path: "access",
        component: AccessTokenComponent,
      },
      {
        path: "people",
        component: ServiceAccountPeopleComponent,
      },
      {
        path: "projects",
        component: ServiceAccountProjectsComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ServiceAccountsRoutingModule {}
