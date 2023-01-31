import { NgModule } from "@angular/core";

import { PipesModule } from "../../../../vault/app/vault/pipes/pipes.module";
import { SharedModule } from "../../../shared";

import { GroupNameBadgeComponent } from "./group-name-badge.component";

@NgModule({
  imports: [SharedModule, PipesModule],
  declarations: [GroupNameBadgeComponent],
  exports: [GroupNameBadgeComponent],
})
export class GroupBadgeModule {}
