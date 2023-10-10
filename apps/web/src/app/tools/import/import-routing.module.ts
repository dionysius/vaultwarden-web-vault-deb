import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { ImportComponent } from "./import.component";

const routes: Routes = [
  {
    path: "",
    component: ImportComponent,
    data: { titleId: "importData" },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class ImportRoutingModule {}
