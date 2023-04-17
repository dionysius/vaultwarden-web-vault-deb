import { EventView } from "../models/view/event.view";

export const EXPORT_FORMATS = ["csv", "json", "encrypted_json"] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];
export abstract class ExportService {
  getExport: (format?: ExportFormat, organizationId?: string) => Promise<string>;
  getPasswordProtectedExport: (password: string, organizationId?: string) => Promise<string>;
  getOrganizationExport: (organizationId: string, format?: ExportFormat) => Promise<string>;
  getEventExport: (events: EventView[]) => Promise<string>;
  getFileName: (prefix?: string, extension?: string) => string;
}
