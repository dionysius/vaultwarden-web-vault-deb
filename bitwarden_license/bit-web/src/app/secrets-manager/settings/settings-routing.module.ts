import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { SecretsManagerExportComponent } from "./porting/sm-export.component";
import { SecretsManagerImportComponent } from "./porting/sm-import.component";

const routes: Routes = [
  {
    path: "import",
    component: SecretsManagerImportComponent,
    data: {
      titleId: "importData",
    },
  },
  {
    path: "export",
    component: SecretsManagerExportComponent,
    data: {
      titleId: "exportData",
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsRoutingModule {}
