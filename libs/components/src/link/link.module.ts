import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { AnchorLinkDirective, ButtonLinkDirective } from "./link.directive";

@NgModule({
  imports: [CommonModule],
  exports: [AnchorLinkDirective, ButtonLinkDirective],
  declarations: [AnchorLinkDirective, ButtonLinkDirective],
})
export class LinkModule {}
