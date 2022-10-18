import { Cipher } from "../domain/cipher";

import { CipherRequest } from "./cipher.request";

export class CipherWithIdRequest extends CipherRequest {
  id: string;

  constructor(cipher: Cipher) {
    super(cipher);
    this.id = cipher.id;
  }
}
