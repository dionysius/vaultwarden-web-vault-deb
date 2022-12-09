import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AccessTokenComponent } from "./access/access-tokens.component";
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
        redirectTo: "access",
      },
      {
        path: "access",
        component: AccessTokenComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ServiceAccountsRoutingModule {}
