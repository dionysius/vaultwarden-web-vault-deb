import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { BadgeModule } from "../badge";

import { ToggleGroupComponent } from "./toggle-group.component";
import { ToggleComponent } from "./toggle.component";

@NgModule({
  imports: [CommonModule, BadgeModule],
  exports: [ToggleGroupComponent, ToggleComponent],
  declarations: [ToggleGroupComponent, ToggleComponent],
})
export class ToggleGroupModule {}
