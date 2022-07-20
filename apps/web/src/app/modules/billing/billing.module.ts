import { NgModule } from "@angular/core";

import { SharedModule } from "../shared.module";

import { BillingComponent } from "./billing.component";

@NgModule({
  imports: [SharedModule],
  declarations: [BillingComponent],
  exports: [BillingComponent],
})
export class BillingModule {}
