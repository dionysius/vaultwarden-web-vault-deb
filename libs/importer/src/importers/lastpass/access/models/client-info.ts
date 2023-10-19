import { Utils } from "@bitwarden/common/platform/misc/utils";

import { Platform } from "../enums";

export class ClientInfo {
  platform: Platform;
  id: string;
  description: string;

  static createClientInfo(): ClientInfo {
    return { platform: Platform.Desktop, id: Utils.newGuid(), description: "Importer" };
  }
}
