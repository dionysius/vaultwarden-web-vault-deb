import { NgModule } from "@angular/core";

import { GetCollectionNameFromIdPipe } from "./get-collection-name.pipe";
import { GetGroupNameFromIdPipe } from "./get-group-name.pipe";
import { GetOrgNameFromIdPipe } from "./get-organization-name.pipe";

@NgModule({
  declarations: [GetOrgNameFromIdPipe, GetCollectionNameFromIdPipe, GetGroupNameFromIdPipe],
  exports: [GetOrgNameFromIdPipe, GetCollectionNameFromIdPipe, GetGroupNameFromIdPipe],
})
export class PipesModule {}
