import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { ColorPasswordComponent } from "./color-password.component";

@NgModule({
  imports: [CommonModule],
  exports: [ColorPasswordComponent],
  declarations: [ColorPasswordComponent],
})
export class ColorPasswordModule {}
