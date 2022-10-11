import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";

import { BadgeModule } from "../badge";
import { SharedModule } from "../shared";

import { MultiSelectComponent } from "./multi-select.component";

@NgModule({
  imports: [CommonModule, FormsModule, NgSelectModule, BadgeModule, SharedModule],
  exports: [MultiSelectComponent],
  declarations: [MultiSelectComponent],
})
export class MultiSelectModule {}
