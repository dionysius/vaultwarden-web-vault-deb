import { KeysRequest } from "./keys.request";

export class OrganizationKeysRequest extends KeysRequest {
  constructor(publicKey: string, encryptedPrivateKey: string) {
    super(publicKey, encryptedPrivateKey);
  }
}
