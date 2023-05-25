import { NgModule } from "@angular/core";

import { SharedModule } from "../../shared.module";

import { UserVerificationPromptComponent } from "./user-verification-prompt.component";
import { UserVerificationComponent } from "./user-verification.component";

@NgModule({
  imports: [SharedModule],
  declarations: [UserVerificationComponent, UserVerificationPromptComponent],
  exports: [UserVerificationComponent, UserVerificationPromptComponent],
})
export class UserVerificationModule {}
