import { NgModule } from "@angular/core";

import { BadgeModule } from "../badge";
import { SharedModule } from "../shared";

import { BadgeListComponent } from "./badge-list.component";

@NgModule({
  imports: [SharedModule, BadgeModule],
  exports: [BadgeListComponent],
  declarations: [BadgeListComponent],
})
export class BadgeListModule {}
