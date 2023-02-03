import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { TypographyDirective } from "./typography.directive";

@NgModule({
  imports: [CommonModule],
  exports: [TypographyDirective],
  declarations: [TypographyDirective],
})
export class TypographyModule {}
