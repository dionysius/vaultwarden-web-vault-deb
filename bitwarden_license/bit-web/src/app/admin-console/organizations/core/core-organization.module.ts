import { NgModule } from "@angular/core";

import { OrganizationAuthRequestService } from "./services/auth-requests";

@NgModule({
  providers: [OrganizationAuthRequestService],
})
export class CoreOrganizationModule {}
