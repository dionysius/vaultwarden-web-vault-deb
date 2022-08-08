import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { LinkDirective } from "./link.directive";

@NgModule({
  imports: [CommonModule],
  exports: [LinkDirective],
  declarations: [LinkDirective],
})
export class LinkModule {}
