import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";

import { OptionComponent } from "./option.component";
import { SelectComponent } from "./select.component";

@NgModule({
  imports: [CommonModule, NgSelectModule, FormsModule],
  declarations: [SelectComponent, OptionComponent],
  exports: [SelectComponent, OptionComponent],
})
export class SelectModule {}
