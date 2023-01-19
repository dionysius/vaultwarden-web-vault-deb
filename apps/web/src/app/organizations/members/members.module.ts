import { NgModule } from "@angular/core";

import { LooseComponentsModule } from "../../shared";
import { SharedOrganizationModule } from "../shared";

import { BulkConfirmComponent } from "./components/bulk/bulk-confirm.component";
import { BulkRemoveComponent } from "./components/bulk/bulk-remove.component";
import { BulkRestoreRevokeComponent } from "./components/bulk/bulk-restore-revoke.component";
import { BulkStatusComponent } from "./components/bulk/bulk-status.component";
import { UserDialogModule } from "./components/member-dialog";
import { ResetPasswordComponent } from "./components/reset-password.component";
import { MembersRoutingModule } from "./members-routing.module";
import { PeopleComponent } from "./people.component";

@NgModule({
  imports: [
    SharedOrganizationModule,
    LooseComponentsModule,
    MembersRoutingModule,
    UserDialogModule,
  ],
  declarations: [
    BulkConfirmComponent,
    BulkRemoveComponent,
    BulkRestoreRevokeComponent,
    BulkStatusComponent,
    PeopleComponent,
    ResetPasswordComponent,
  ],
})
export class MembersModule {}
