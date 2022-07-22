import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { LayoutComponent } from "./layout/layout.component";
import { NavigationComponent } from "./layout/navigation.component";
import { SecretsModule } from "./secrets/secrets.module";
import { SMGuard } from "./sm.guard";

const routes: Routes = [
  {
    path: "",
    component: LayoutComponent,
    canActivate: [SMGuard],
    children: [
      {
        path: "",
        component: NavigationComponent,
        outlet: "sidebar",
      },
      {
        path: "secrets",
        loadChildren: () => SecretsModule,
      },
      {
        path: "",
        redirectTo: "secrets",
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SecretsManagerRoutingModule {}
