import { NgModule } from "@angular/core";

import { SelectModule } from "@bitwarden/components";

import { AccessSelectorModule } from "../../../admin-console/organizations/shared/components/access-selector/access-selector.module";
import { SharedModule } from "../../../shared";

import { CollectionDialogComponent } from "./collection-dialog.component";
@NgModule({
  imports: [SharedModule, AccessSelectorModule, SelectModule],
  declarations: [CollectionDialogComponent],
  exports: [CollectionDialogComponent],
})
export class CollectionDialogModule {}
