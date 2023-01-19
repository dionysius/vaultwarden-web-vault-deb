import { NgModule } from "@angular/core";

import { SharedModule } from "../../../../shared/shared.module";
import { AccessSelectorModule } from "../access-selector";

import { CollectionDialogComponent } from "./collection-dialog.component";

@NgModule({
  imports: [SharedModule, AccessSelectorModule],
  declarations: [CollectionDialogComponent],
  exports: [CollectionDialogComponent],
})
export class CollectionDialogModule {}
