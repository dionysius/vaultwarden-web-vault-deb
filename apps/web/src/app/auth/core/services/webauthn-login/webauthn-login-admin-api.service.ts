import { Injectable } from "@angular/core";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { SecretVerificationRequest } from "@bitwarden/common/auth/models/request/secret-verification.request";
import { ListResponse } from "@bitwarden/common/models/response/list.response";

import { SaveCredentialRequest } from "./request/save-credential.request";
import { WebauthnLoginCredentialCreateOptionsResponse } from "./response/webauthn-login-credential-create-options.response";
import { WebauthnLoginCredentialResponse } from "./response/webauthn-login-credential.response";

@Injectable({ providedIn: "root" })
export class WebAuthnLoginAdminApiService {
  constructor(private apiService: ApiService) {}

  async getCredentialCreateOptions(
    request: SecretVerificationRequest,
  ): Promise<WebauthnLoginCredentialCreateOptionsResponse> {
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

  async deleteCredential(credentialId: string, request: SecretVerificationRequest): Promise<void> {
    await this.apiService.send("POST", `/webauthn/${credentialId}/delete`, request, true, true);
  }
}
