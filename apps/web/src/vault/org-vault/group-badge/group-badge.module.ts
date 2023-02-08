import { NgModule } from "@angular/core";

import { SharedModule } from "../../../app/shared";
import { PipesModule } from "../../individual-vault/pipes/pipes.module";

import { GroupNameBadgeComponent } from "./group-name-badge.component";

@NgModule({
  imports: [SharedModule, PipesModule],
  declarations: [GroupNameBadgeComponent],
  exports: [GroupNameBadgeComponent],
})
export class GroupBadgeModule {}
