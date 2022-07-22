import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { SecretsComponent } from "./secrets.component";

const routes: Routes = [
  {
    path: "",
    component: SecretsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SecretsRoutingModule {}
