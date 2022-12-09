import { EncString } from "@bitwarden/common/models/domain/enc-string";

export class AccessTokenRequest {
  name: EncString;
  encryptedPayload: EncString;
  key: EncString;
  expireAt: Date;
}
