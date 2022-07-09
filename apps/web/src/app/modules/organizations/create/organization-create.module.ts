import { NgModule } from "@angular/core";

import { SharedModule } from "../../shared.module";

import { OrganizationInformationComponent } from "./organization-information.component";

@NgModule({
  imports: [SharedModule],
  declarations: [OrganizationInformationComponent],
  exports: [OrganizationInformationComponent],
})
export class OrganizationCreateModule {}
