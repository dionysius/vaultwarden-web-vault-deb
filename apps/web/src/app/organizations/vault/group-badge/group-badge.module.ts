import { NgModule } from "@angular/core";

import { SharedModule } from "../../../shared";
import { PipesModule } from "../../../vault/pipes/pipes.module";

import { GroupNameBadgeComponent } from "./group-name-badge.component";

@NgModule({
  imports: [SharedModule, PipesModule],
  declarations: [GroupNameBadgeComponent],
  exports: [GroupNameBadgeComponent],
})
export class GroupBadgeModule {}
