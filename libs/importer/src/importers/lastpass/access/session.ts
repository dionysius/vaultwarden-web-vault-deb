import { Platform } from "./platform";

export class Session {
  id: string;
  keyIterationCount: number;
  token: string;
  platform: Platform;
  encryptedPrivateKey: string;
}
