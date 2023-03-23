import { Importer } from "../importers/importer";
import { ImportError } from "../models/import-error";
import { ImportOption, ImportType } from "../models/import-options";

export abstract class ImportServiceAbstraction {
  featuredImportOptions: readonly ImportOption[];
  regularImportOptions: readonly ImportOption[];
  getImportOptions: () => ImportOption[];
  import: (
    importer: Importer,
    fileContents: string,
    organizationId?: string
  ) => Promise<ImportError>;
  getImporter: (
    format: ImportType | "bitwardenpasswordprotected",
    organizationId: string,
    password?: string
  ) => Importer;
}
