import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { ProvidersModule } from "./providers/providers.module";

const routes: Routes = [
  {
    path: "providers",
    loadChildren: () => ProvidersModule,
  },
  {
    path: "sm",
    loadChildren: async () =>
      (await import("./secrets-manager/secrets-manager.module")).SecretsManagerModule,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
