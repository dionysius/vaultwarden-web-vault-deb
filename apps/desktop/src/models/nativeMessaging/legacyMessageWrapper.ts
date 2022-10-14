import { EncString } from "@bitwarden/common/models/domain/enc-string";

import { LegacyMessage } from "./legacyMessage";

export type LegacyMessageWrapper = {
  message: LegacyMessage | EncString;
  appId: string;
};
