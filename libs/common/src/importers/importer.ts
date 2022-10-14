import { ImportResult } from "../models/domain/import-result";

export interface Importer {
  organizationId: string;
  parse(data: string): Promise<ImportResult>;
}
