import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { ListResponse } from "@bitwarden/common/models/response/list.response";
import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { EncryptService } from "@bitwarden/common/platform/abstractions/encrypt.service";
import { EncString } from "@bitwarden/common/platform/models/domain/enc-string";
import { SymmetricCryptoKey } from "@bitwarden/common/platform/models/domain/symmetric-crypto-key";

import { ServiceAccountView } from "../models/view/service-account.view";
import { BulkOperationStatus } from "../shared/dialogs/bulk-status-dialog.component";

import { ServiceAccountRequest } from "./models/requests/service-account.request";
import { ServiceAccountResponse } from "./models/responses/service-account.response";

@Injectable({
  providedIn: "root",
})
export class ServiceAccountService {
  protected _serviceAccount: Subject<ServiceAccountView> = new Subject();

  serviceAccount$ = this._serviceAccount.asObservable();

  constructor(
    private cryptoService: CryptoService,
    private apiService: ApiService,
    private encryptService: EncryptService
  ) {}

  async getServiceAccounts(organizationId: string): Promise<ServiceAccountView[]> {
    const r = await this.apiService.send(
      "GET",
      "/organizations/" + organizationId + "/service-accounts",
      null,
      true,
      true
    );
    const results = new ListResponse(r, ServiceAccountResponse);
    return await this.createServiceAccountViews(organizationId, results.data);
  }

  async getByServiceAccountId(
    serviceAccountId: string,
    organizationId: string
  ): Promise<ServiceAccountView> {
    const orgKey = await this.getOrganizationKey(organizationId);
    const r = await this.apiService.send(
      "GET",
      "/service-accounts/" + serviceAccountId,
      null,
      true,
      true
    );

    return await this.createServiceAccountView(orgKey, new ServiceAccountResponse(r));
  }

  async update(
    serviceAccountId: string,
    organizationId: string,
    serviceAccountView: ServiceAccountView
  ) {
    const orgKey = await this.getOrganizationKey(organizationId);
    const request = await this.getServiceAccountRequest(orgKey, serviceAccountView);
    const r = await this.apiService.send(
      "PUT",
      "/service-accounts/" + serviceAccountId,
      request,
      true,
      true
    );
    this._serviceAccount.next(
      await this.createServiceAccountView(orgKey, new ServiceAccountResponse(r))
    );
  }

  async create(organizationId: string, serviceAccountView: ServiceAccountView) {
    const orgKey = await this.getOrganizationKey(organizationId);
    const request = await this.getServiceAccountRequest(orgKey, serviceAccountView);
    const r = await this.apiService.send(
      "POST",
      "/organizations/" + organizationId + "/service-accounts",
      request,
      true,
      true
    );
    this._serviceAccount.next(
      await this.createServiceAccountView(orgKey, new ServiceAccountResponse(r))
    );
  }

  async delete(serviceAccounts: ServiceAccountView[]): Promise<BulkOperationStatus[]> {
    const ids = serviceAccounts.map((serviceAccount) => serviceAccount.id);
    const r = await this.apiService.send("POST", "/service-accounts/delete", ids, true, true);

    this._serviceAccount.next(null);

    return r.data.map((element: { id: string; error: string }) => {
      const bulkOperationStatus = new BulkOperationStatus();
      bulkOperationStatus.id = element.id;
      bulkOperationStatus.name = serviceAccounts.find((sa) => sa.id == element.id).name;
      bulkOperationStatus.errorMessage = element.error;
      return bulkOperationStatus;
    });
  }

  private async getOrganizationKey(organizationId: string): Promise<SymmetricCryptoKey> {
    return await this.cryptoService.getOrgKey(organizationId);
  }

  private async getServiceAccountRequest(
    organizationKey: SymmetricCryptoKey,
    serviceAccountView: ServiceAccountView
  ) {
    const request = new ServiceAccountRequest();
    request.name = await this.encryptService.encrypt(serviceAccountView.name, organizationKey);
    return request;
  }

  private async createServiceAccountView(
    organizationKey: SymmetricCryptoKey,
    serviceAccountResponse: ServiceAccountResponse
  ): Promise<ServiceAccountView> {
    const serviceAccountView = new ServiceAccountView();
    serviceAccountView.id = serviceAccountResponse.id;
    serviceAccountView.organizationId = serviceAccountResponse.organizationId;
    serviceAccountView.creationDate = serviceAccountResponse.creationDate;
    serviceAccountView.revisionDate = serviceAccountResponse.revisionDate;
    serviceAccountView.name = await this.encryptService.decryptToUtf8(
      new EncString(serviceAccountResponse.name),
      organizationKey
    );
    return serviceAccountView;
  }

  private async createServiceAccountViews(
    organizationId: string,
    serviceAccountResponses: ServiceAccountResponse[]
  ): Promise<ServiceAccountView[]> {
    const orgKey = await this.getOrganizationKey(organizationId);
    return await Promise.all(
      serviceAccountResponses.map(async (s: ServiceAccountResponse) => {
        return await this.createServiceAccountView(orgKey, s);
      })
    );
  }
}
