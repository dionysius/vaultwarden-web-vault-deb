import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { SecretsRoutingModule } from "./secrets-routing.module";
import { SecretsComponent } from "./secrets.component";

@NgModule({
  imports: [CommonModule, SecretsRoutingModule],
  declarations: [SecretsComponent],
  providers: [],
})
export class SecretsModule {}
