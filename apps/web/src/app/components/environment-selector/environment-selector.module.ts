import { NgModule } from "@angular/core";

import { SharedModule } from "../../../app/shared";

import { EnvironmentSelectorComponent } from "./environment-selector.component";

@NgModule({
  imports: [SharedModule],
  declarations: [EnvironmentSelectorComponent],
  exports: [EnvironmentSelectorComponent],
})
export class EnvironmentSelectorModule {}
