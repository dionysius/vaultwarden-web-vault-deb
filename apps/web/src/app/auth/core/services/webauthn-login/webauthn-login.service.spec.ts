import { mock, MockProxy } from "jest-mock-extended";

import { CredentialCreateOptionsView } from "../../views/credential-create-options.view";

import { WebauthnLoginApiService } from "./webauthn-login-api.service";
import { WebauthnLoginService } from "./webauthn-login.service";

describe("WebauthnService", () => {
  let apiService!: MockProxy<WebauthnLoginApiService>;
  let credentials: MockProxy<CredentialsContainer>;
  let webauthnService!: WebauthnLoginService;

  beforeAll(() => {
    // Polyfill missing class
    window.PublicKeyCredential = class {} as any;
    window.AuthenticatorAttestationResponse = class {} as any;
    apiService = mock<WebauthnLoginApiService>();
    credentials = mock<CredentialsContainer>();
    webauthnService = new WebauthnLoginService(apiService, credentials);
  });

  describe("createCredential", () => {
    it("should return undefined when navigator.credentials throws", async () => {
      credentials.create.mockRejectedValue(new Error("Mocked error"));
      const options = createCredentialCreateOptions();

      const result = await webauthnService.createCredential(options);

      expect(result).toBeUndefined();
    });

    it("should return credential when navigator.credentials does not throw", async () => {
      const credential = createDeviceResponse();
      credentials.create.mockResolvedValue(credential as PublicKeyCredential);
      const options = createCredentialCreateOptions();

      const result = await webauthnService.createCredential(options);

      expect(result).toBe(credential);
    });
  });
});

function createCredentialCreateOptions(): CredentialCreateOptionsView {
  return new CredentialCreateOptionsView(Symbol() as any, Symbol() as any);
}

function createDeviceResponse(): PublicKeyCredential {
  const credential = {
    id: "dGVzdA==",
    rawId: new Uint8Array([0x74, 0x65, 0x73, 0x74]),
    type: "public-key",
    response: {
      attestationObject: new Uint8Array([0, 0, 0]),
      clientDataJSON: "eyJ0ZXN0IjoidGVzdCJ9",
    },
  } as any;

  Object.setPrototypeOf(credential, PublicKeyCredential.prototype);
  Object.setPrototypeOf(credential.response, AuthenticatorAttestationResponse.prototype);

  return credential;
}
