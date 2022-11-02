import { Component, Input } from "@angular/core";

import { ReportEntry } from "../models/report-entry";

@Component({
  selector: "app-report-list",
  templateUrl: "report-list.component.html",
})
export class ReportListComponent {
  @Input() reports: ReportEntry[];
}
