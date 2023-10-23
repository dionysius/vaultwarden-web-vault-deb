import { Platform } from "../enums";

export class ClientInfo {
  platform: Platform;
  id: string;
  description: string;

  static createClientInfo(id: string): ClientInfo {
    return { platform: Platform.Desktop, id, description: "Importer" };
  }
}
