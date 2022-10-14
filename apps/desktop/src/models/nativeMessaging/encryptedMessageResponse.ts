import { EncString } from "@bitwarden/common/models/domain/enc-string";

import { MessageCommon } from "./messageCommon";

export type EncryptedMessageResponse = MessageCommon & {
  encryptedPayload: EncString;
};
