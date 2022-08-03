import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { BitIconComponent } from "./icon.component";

@NgModule({
  imports: [CommonModule],
  declarations: [BitIconComponent],
  exports: [BitIconComponent],
})
export class IconModule {}
