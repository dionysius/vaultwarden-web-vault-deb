import { NgModule } from "@angular/core";

import { SearchModule } from "@bitwarden/components";

import { SharedModule } from "../../../shared/shared.module";

import { AccessSelectorModule } from "./components/access-selector/access-selector.module";
import { CollectionDialogModule } from "./components/collection-dialog";

@NgModule({
  imports: [SharedModule, CollectionDialogModule, AccessSelectorModule, SearchModule],
  declarations: [],
  exports: [SharedModule, CollectionDialogModule, AccessSelectorModule, SearchModule],
})
export class SharedOrganizationModule {}
