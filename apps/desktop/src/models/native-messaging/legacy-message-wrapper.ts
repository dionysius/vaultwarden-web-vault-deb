import { EncString } from "@bitwarden/common/models/domain/enc-string";

import { LegacyMessage } from "./legacy-message";

export type LegacyMessageWrapper = {
  message: LegacyMessage | EncString;
  appId: string;
};
