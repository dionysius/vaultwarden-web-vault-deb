import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { FormControlModule } from "../form-control";
import { SharedModule } from "../shared";

import { CheckboxComponent } from "./checkbox.component";

@NgModule({
  imports: [SharedModule, CommonModule, FormControlModule],
  declarations: [CheckboxComponent],
  exports: [CheckboxComponent],
})
export class CheckboxModule {}
