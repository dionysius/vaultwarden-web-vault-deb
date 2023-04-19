export const EXPORT_FORMATS = ["csv", "json", "encrypted_json"] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

export abstract class VaultExportServiceAbstraction {
  getExport: (format?: ExportFormat, organizationId?: string) => Promise<string>;
  getPasswordProtectedExport: (password: string, organizationId?: string) => Promise<string>;
  getOrganizationExport: (organizationId: string, format?: ExportFormat) => Promise<string>;
  getFileName: (prefix?: string, extension?: string) => string;
}
