import { PasswordRequest } from "../../auth/models/request/password.request";
import { KdfType } from "../../platform/enums";

export class KdfRequest extends PasswordRequest {
  kdf: KdfType;
  kdfIterations: number;
  kdfMemory?: number;
  kdfParallelism?: number;
}
