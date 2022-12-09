import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { EncryptService } from "@bitwarden/common/abstractions/encrypt.service";
import { EncString } from "@bitwarden/common/models/domain/enc-string";
import { SymmetricCryptoKey } from "@bitwarden/common/models/domain/symmetric-crypto-key";
import { ListResponse } from "@bitwarden/common/models/response/list.response";

import { ServiceAccountView } from "../models/view/service-account.view";

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
