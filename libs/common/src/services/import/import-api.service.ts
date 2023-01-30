import { ApiService } from "../../abstractions/api.service";
import { ImportApiServiceAbstraction } from "../../abstractions/import/import-api.service.abstraction";
import { ImportCiphersRequest } from "../../models/request/import-ciphers.request";
import { ImportOrganizationCiphersRequest } from "../../models/request/import-organization-ciphers.request";

export class ImportApiService implements ImportApiServiceAbstraction {
  constructor(private apiService: ApiService) {}

  async postImportCiphers(request: ImportCiphersRequest): Promise<any> {
    return await this.apiService.send("POST", "/ciphers/import", request, true, false);
  }

  async postImportOrganizationCiphers(
    organizationId: string,
    request: ImportOrganizationCiphersRequest
  ): Promise<any> {
    return await this.apiService.send(
      "POST",
      "/ciphers/import-organization?organizationId=" + organizationId,
      request,
      true,
      false
    );
  }
}
