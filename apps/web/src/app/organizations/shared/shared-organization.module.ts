import { NgModule } from "@angular/core";

import { SharedModule } from "../../shared";

import { SearchInputComponent } from "./components/search-input/search-input.component";

@NgModule({
  imports: [SharedModule],
  declarations: [SearchInputComponent],
  exports: [SharedModule, SearchInputComponent],
})
export class SharedOrganizationModule {}
