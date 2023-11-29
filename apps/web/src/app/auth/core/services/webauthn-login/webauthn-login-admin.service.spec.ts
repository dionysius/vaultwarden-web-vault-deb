import { mock, MockProxy } from "jest-mock-extended";

import { UserVerificationService } from "@bitwarden/common/auth/abstractions/user-verification/user-verification.service.abstraction";
import { WebAuthnLoginPrfCryptoServiceAbstraction } from "@bitwarden/common/auth/abstractions/webauthn/webauthn-login-prf-crypto.service.abstraction";

import { CredentialCreateOptionsView } from "../../views/credential-create-options.view";
import { PendingWebauthnLoginCredentialView } from "../../views/pending-webauthn-login-credential.view";
import { RotateableKeySetService } from "../rotateable-key-set.service";

import { WebAuthnLoginAdminApiService } from "./webauthn-login-admin-api.service";
import { WebauthnLoginAdminService } from "./webauthn-login-admin.service";

describe("WebauthnAdminService", () => {
  let apiService!: MockProxy<WebAuthnLoginAdminApiService>;
  let userVerificationService!: MockProxy<UserVerificationService>;
  let rotateableKeySetService!: MockProxy<RotateableKeySetService>;
  let webAuthnLoginPrfCryptoService!: MockProxy<WebAuthnLoginPrfCryptoServiceAbstraction>;
  let credentials: MockProxy<CredentialsContainer>;
  let service!: WebauthnLoginAdminService;

  beforeAll(() => {
    // Polyfill missing class
    window.PublicKeyCredential = class {} as any;
    window.AuthenticatorAttestationResponse = class {} as any;
    apiService = mock<WebAuthnLoginAdminApiService>();
    userVerificationService = mock<UserVerificationService>();
    rotateableKeySetService = mock<RotateableKeySetService>();
    webAuthnLoginPrfCryptoService = mock<WebAuthnLoginPrfCryptoServiceAbstraction>();
    credentials = mock<CredentialsContainer>();
    service = new WebauthnLoginAdminService(
      apiService,
      userVerificationService,
      rotateableKeySetService,
      webAuthnLoginPrfCryptoService,
      credentials,
    );
  });

  describe("createCredential", () => {
    it("should return undefined when navigator.credentials throws", async () => {
      credentials.create.mockRejectedValue(new Error("Mocked error"));
      const options = createCredentialCreateOptions();

      const result = await service.createCredential(options);

      expect(result).toBeUndefined();
    });

    it("should return credential when navigator.credentials does not throw", async () => {
      const deviceResponse = createDeviceResponse({ prf: false });
      credentials.create.mockResolvedValue(deviceResponse as PublicKeyCredential);
      const createOptions = createCredentialCreateOptions();

      const result = await service.createCredential(createOptions);

      expect(result).toEqual({
        deviceResponse,
        createOptions,
        supportsPrf: false,
      } as PendingWebauthnLoginCredentialView);
    });

    it("should return supportsPrf=true when extensions contain prf", async () => {
      const deviceResponse = createDeviceResponse({ prf: true });
      credentials.create.mockResolvedValue(deviceResponse as PublicKeyCredential);
      const createOptions = createCredentialCreateOptions();

      const result = await service.createCredential(createOptions);

      expect(result.supportsPrf).toBe(true);
    });
  });
});

function createCredentialCreateOptions(): CredentialCreateOptionsView {
  const challenge = {
    publicKey: {
      extensions: {},
    },
    rp: {
      id: "bitwarden.com",
    },
    authenticatorSelection: {
      userVerification: "required",
      residentKey: "required",
    },
  };
  return new CredentialCreateOptionsView(challenge as any, Symbol() as any);
}

function createDeviceResponse({ prf = false }: { prf?: boolean } = {}): PublicKeyCredential {
  const credential = {
    id: "Y29yb2l1IHdhcyBoZXJl",
    rawId: new Uint8Array([0x74, 0x65, 0x73, 0x74]),
    type: "public-key",
    response: {
      attestationObject: new Uint8Array([0, 0, 0]),
      clientDataJSON: "eyJ0ZXN0IjoidGVzdCJ9",
    },
    getClientExtensionResults: () => {
      if (!prf) {
        return {};
      }

      return {
        prf: {
          enabled: true,
        },
      };
    },
  } as any;

  Object.setPrototypeOf(credential, PublicKeyCredential.prototype);
  Object.setPrototypeOf(credential.response, AuthenticatorAttestationResponse.prototype);

  return credential;
}
