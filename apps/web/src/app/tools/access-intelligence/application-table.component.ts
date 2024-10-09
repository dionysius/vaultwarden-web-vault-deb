import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { TableDataSource, TableModule } from "@bitwarden/components";

@Component({
  standalone: true,
  selector: "tools-application-table",
  templateUrl: "./application-table.component.html",
  imports: [CommonModule, JslibModule, TableModule],
})
export class ApplicationTableComponent {
  protected dataSource = new TableDataSource<any>();

  constructor() {
    this.dataSource.data = [];
  }
}
