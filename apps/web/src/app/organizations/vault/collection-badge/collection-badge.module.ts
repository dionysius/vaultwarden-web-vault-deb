import { NgModule } from "@angular/core";

import { PipesModule } from "../../../../vault/app/vault/pipes/pipes.module";
import { SharedModule } from "../../../shared";

import { CollectionNameBadgeComponent } from "./collection-name.badge.component";

@NgModule({
  imports: [SharedModule, PipesModule],
  declarations: [CollectionNameBadgeComponent],
  exports: [CollectionNameBadgeComponent],
})
export class CollectionBadgeModule {}
