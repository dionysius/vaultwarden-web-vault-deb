import { EncString } from "@bitwarden/common/platform/models/domain/enc-string";

export class AccessTokenRequest {
  name: EncString;
  encryptedPayload: EncString;
  key: EncString;
  expireAt: Date;
}
