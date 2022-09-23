import { EncString } from "@bitwarden/common/models/domain/encString";

import { MessageCommon } from "./messageCommon";

export type EncryptedMessageResponse = MessageCommon & {
  encryptedPayload: EncString;
};
