import { NgModule } from "@angular/core";

import { LooseComponentsModule, SharedModule } from "../../shared";

import { ExportRoutingModule } from "./export-routing.module";
import { ExportComponent } from "./export.component";

@NgModule({
  imports: [SharedModule, LooseComponentsModule, ExportRoutingModule],
  declarations: [ExportComponent],
})
export class ExportModule {}
