import { NgModule } from "@angular/core";

import { SharedModule } from "../../shared/shared.module";

import { AccessSelectorModule } from "./components/access-selector";
import { CollectionDialogModule } from "./components/collection-dialog";
import { SearchInputComponent } from "./components/search-input/search-input.component";

@NgModule({
  imports: [SharedModule, CollectionDialogModule, AccessSelectorModule],
  declarations: [SearchInputComponent],
  exports: [SharedModule, CollectionDialogModule, AccessSelectorModule, SearchInputComponent],
})
export class SharedOrganizationModule {}
