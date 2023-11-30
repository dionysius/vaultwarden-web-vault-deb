import { SymmetricCryptoKey, UserKey } from "../../platform/models/domain/symmetric-crypto-key";
import { AuthResult } from "../models/domain/auth-result";
import { WebAuthnLoginCredentials } from "../models/domain/login-credentials";
import { WebAuthnLoginTokenRequest } from "../models/request/identity-token/webauthn-login-token.request";
import { IdentityTokenResponse } from "../models/response/identity-token.response";

import { LoginStrategy } from "./login.strategy";

export class WebAuthnLoginStrategy extends LoginStrategy {
  tokenRequest: WebAuthnLoginTokenRequest;
  private credentials: WebAuthnLoginCredentials;

  protected override async setMasterKey() {
    return Promise.resolve();
  }

  protected override async setUserKey(idTokenResponse: IdentityTokenResponse) {
    const masterKeyEncryptedUserKey = idTokenResponse.key;

    if (masterKeyEncryptedUserKey) {
      // set the master key encrypted user key if it exists
      await this.cryptoService.setMasterKeyEncryptedUserKey(masterKeyEncryptedUserKey);
    }

    const userDecryptionOptions = idTokenResponse?.userDecryptionOptions;

    if (userDecryptionOptions?.webAuthnPrfOption) {
      const webAuthnPrfOption = idTokenResponse.userDecryptionOptions?.webAuthnPrfOption;

      // confirm we still have the prf key
      if (!this.credentials.prfKey) {
        return;
      }

      // decrypt prf encrypted private key
      const privateKey = await this.cryptoService.decryptToBytes(
        webAuthnPrfOption.encryptedPrivateKey,
        this.credentials.prfKey,
      );

      // decrypt user key with private key
      const userKey = await this.cryptoService.rsaDecrypt(
        webAuthnPrfOption.encryptedUserKey.encryptedString,
        privateKey,
      );

      if (userKey) {
        await this.cryptoService.setUserKey(new SymmetricCryptoKey(userKey) as UserKey);
      }
    }
  }

  protected override async setPrivateKey(response: IdentityTokenResponse): Promise<void> {
    await this.cryptoService.setPrivateKey(
      response.privateKey ?? (await this.createKeyPairForOldAccount()),
    );
  }

  async logInTwoFactor(): Promise<AuthResult> {
    throw new Error("2FA not supported yet for WebAuthn Login.");
  }

  async logIn(credentials: WebAuthnLoginCredentials) {
    // NOTE: To avoid DeadObject references on Firefox, do not set the credentials object directly
    // Use deep copy in future if objects are added that were created in popup
    this.credentials = { ...credentials };

    this.tokenRequest = new WebAuthnLoginTokenRequest(
      credentials.token,
      credentials.deviceResponse,
      await this.buildDeviceRequest(),
    );

    const [authResult] = await this.startLogIn();
    return authResult;
  }
}
