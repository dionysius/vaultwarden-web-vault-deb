import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { CellDirective } from "./cell.directive";
import { RowDirective } from "./row.directive";
import { TableComponent } from "./table.component";

@NgModule({
  imports: [CommonModule],
  declarations: [TableComponent, CellDirective, RowDirective],
  exports: [TableComponent, CellDirective, RowDirective],
})
export class TableModule {}
