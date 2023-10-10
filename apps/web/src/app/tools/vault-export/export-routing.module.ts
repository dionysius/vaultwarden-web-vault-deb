import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { ExportComponent } from "./export.component";

const routes: Routes = [
  {
    path: "",
    component: ExportComponent,
    data: { titleId: "exportVault" },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class ExportRoutingModule {}
