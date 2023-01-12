import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { CellDirective } from "./cell.directive";
import { RowDirective } from "./row.directive";
import { SortableComponent } from "./sortable.component";
import { TableBodyDirective, TableComponent } from "./table.component";

@NgModule({
  imports: [CommonModule],
  declarations: [
    TableComponent,
    CellDirective,
    RowDirective,
    SortableComponent,
    TableBodyDirective,
  ],
  exports: [TableComponent, CellDirective, RowDirective, SortableComponent, TableBodyDirective],
})
export class TableModule {}
