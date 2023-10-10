import { Injectable } from "@angular/core";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { UserVerificationService } from "@bitwarden/common/auth/abstractions/user-verification/user-verification.service.abstraction";
import { ListResponse } from "@bitwarden/common/models/response/list.response";
import { Verification } from "@bitwarden/common/types/verification";

import { SaveCredentialRequest } from "./request/save-credential.request";
import { WebauthnLoginCredentialCreateOptionsResponse } from "./response/webauthn-login-credential-create-options.response";
import { WebauthnLoginCredentialResponse } from "./response/webauthn-login-credential.response";

@Injectable()
export class WebauthnLoginApiService {
  constructor(
    private apiService: ApiService,
    private userVerificationService: UserVerificationService
  ) {}

  async getCredentialCreateOptions(
    verification: Verification
  ): Promise<WebauthnLoginCredentialCreateOptionsResponse> {
    const request = await this.userVerificationService.buildRequest(verification);
    const response = await this.apiService.send("POST", "/webauthn/options", request, true, true);
    return new WebauthnLoginCredentialCreateOptionsResponse(response);
  }

  async saveCredential(request: SaveCredentialRequest): Promise<boolean> {
    await this.apiService.send("POST", "/webauthn", request, true, true);
    return true;
  }

  getCredentials(): Promise<ListResponse<WebauthnLoginCredentialResponse>> {
    return this.apiService.send("GET", "/webauthn", null, true, true);
  }

  async deleteCredential(credentialId: string, verification: Verification): Promise<void> {
    const request = await this.userVerificationService.buildRequest(verification);
    await this.apiService.send("POST", `/webauthn/${credentialId}/delete`, request, true, true);
  }
}
