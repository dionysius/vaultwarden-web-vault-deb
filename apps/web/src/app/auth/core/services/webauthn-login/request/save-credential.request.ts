import { WebauthnLoginAttestationResponseRequest } from "./webauthn-login-attestation-response.request";

/**
 * Request sent to the server to save a newly created webauthn login credential.
 */
export class SaveCredentialRequest {
  /** The response recieved from the authenticator. This contains the public key */
  deviceResponse: WebauthnLoginAttestationResponseRequest;

  /** Nickname chosen by the user to identify this credential */
  name: string;

  /**
   * Token required by the server to complete the creation.
   * It contains encrypted information that the server needs to verify the credential.
   */
  token: string;
}
