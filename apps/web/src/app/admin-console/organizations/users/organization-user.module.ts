import { ScrollingModule } from "@angular/cdk/scrolling";
import { NgModule } from "@angular/core";

import { UserVerificationModule } from "../../../auth/shared/components/user-verification";
import { LooseComponentsModule, SharedModule } from "../../../shared";

import { EnrollMasterPasswordReset } from "./enroll-master-password-reset.component";

@NgModule({
  imports: [SharedModule, ScrollingModule, LooseComponentsModule, UserVerificationModule],
  declarations: [EnrollMasterPasswordReset],
  exports: [EnrollMasterPasswordReset],
})
export class OrganizationUserModule {}
