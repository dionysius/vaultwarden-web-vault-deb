import { NgModule } from "@angular/core";

import { GetOrgNameFromIdPipe } from "./get-organization-name.pipe";

@NgModule({
  declarations: [GetOrgNameFromIdPipe],
  exports: [GetOrgNameFromIdPipe],
})
export class PipesModule {}
