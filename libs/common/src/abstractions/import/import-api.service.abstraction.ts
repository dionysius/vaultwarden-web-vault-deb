import { ImportCiphersRequest } from "../../models/request/import-ciphers.request";
import { ImportOrganizationCiphersRequest } from "../../models/request/import-organization-ciphers.request";

export abstract class ImportApiServiceAbstraction {
  postImportCiphers: (request: ImportCiphersRequest) => Promise<any>;
  postImportOrganizationCiphers: (
    organizationId: string,
    request: ImportOrganizationCiphersRequest
  ) => Promise<any>;
}
