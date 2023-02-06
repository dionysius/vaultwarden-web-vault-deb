import { NgModule } from "@angular/core";

import { SelectModule } from "@bitwarden/components";

import { SharedModule } from "../../../../shared/shared.module";
import { AccessSelectorModule } from "../access-selector";

import { CollectionDialogComponent } from "./collection-dialog.component";

@NgModule({
  imports: [SharedModule, AccessSelectorModule, SelectModule],
  declarations: [CollectionDialogComponent],
  exports: [CollectionDialogComponent],
})
export class CollectionDialogModule {}
