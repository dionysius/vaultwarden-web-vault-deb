import { KdfType } from "../../enums/kdfType";

import { PasswordRequest } from "./password.request";

export class KdfRequest extends PasswordRequest {
  kdf: KdfType;
  kdfIterations: number;
}
