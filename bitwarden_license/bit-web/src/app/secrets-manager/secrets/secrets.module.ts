import { NgModule } from "@angular/core";

import { SecretsManagerSharedModule } from "../shared/sm-shared.module";

import { SecretDeleteDialogComponent } from "./dialog/secret-delete.component";
import { SecretDialogComponent } from "./dialog/secret-dialog.component";
import { SecretsRoutingModule } from "./secrets-routing.module";
import { SecretsComponent } from "./secrets.component";

@NgModule({
  imports: [SecretsManagerSharedModule, SecretsRoutingModule],
  declarations: [SecretsComponent, SecretDialogComponent, SecretDeleteDialogComponent],
  providers: [],
})
export class SecretsModule {}
