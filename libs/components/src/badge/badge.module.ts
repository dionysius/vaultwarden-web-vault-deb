import { NgModule } from "@angular/core";

import { BadgeDirective } from "./badge.directive";

@NgModule({
  imports: [BadgeDirective],
  exports: [BadgeDirective],
})
export class BadgeModule {}
