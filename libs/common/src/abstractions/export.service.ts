import { EventView } from "../models/view/event.view";

export type ExportFormat = "csv" | "json" | "encrypted_json";

export abstract class ExportService {
  getExport: (format?: ExportFormat, organizationId?: string) => Promise<string>;
  getPasswordProtectedExport: (password: string, organizationId?: string) => Promise<string>;
  getOrganizationExport: (organizationId: string, format?: ExportFormat) => Promise<string>;
  getEventExport: (events: EventView[]) => Promise<string>;
  getFileName: (prefix?: string, extension?: string) => string;
}
