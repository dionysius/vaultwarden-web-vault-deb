import { NgModule } from "@angular/core";

import { SharedModule } from "../../../shared";
import { PipesModule } from "../../../vault/pipes/pipes.module";

import { CollectionNameBadgeComponent } from "./collection-name.badge.component";

@NgModule({
  imports: [SharedModule, PipesModule],
  declarations: [CollectionNameBadgeComponent],
  exports: [CollectionNameBadgeComponent],
})
export class CollectionBadgeModule {}
