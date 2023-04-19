import { Injectable } from "@angular/core";
import * as papa from "papaparse";

import { EventView } from "@bitwarden/common/models/view/event.view";
import { ExportHelper } from "@bitwarden/exporter/export-helper";

import { EventExport } from "./event.export";

@Injectable({
  providedIn: "root",
})
export class EventExportService {
  async getEventExport(events: EventView[]): Promise<string> {
    return papa.unparse(events.map((e) => new EventExport(e)));
  }

  getFileName(prefix: string = null, extension = "csv"): string {
    return ExportHelper.getFileName(prefix, extension);
  }
}
