import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { ExportComponent } from "./export.component";
import { ImportComponent } from "./import.component";

const routes: Routes = [
  {
    path: "import",
    component: ImportComponent,
    data: { titleId: "importData" },
  },
  {
    path: "export",
    component: ExportComponent,
    data: { titleId: "exportVault" },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class ImportExportRoutingModule {}
