import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { AvatarComponent } from "./avatar.component";

@NgModule({
  imports: [CommonModule],
  exports: [AvatarComponent],
  declarations: [AvatarComponent],
})
export class AvatarModule {}
