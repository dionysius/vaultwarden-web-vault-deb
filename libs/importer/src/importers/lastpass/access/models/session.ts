import { Platform } from "../enums";

export class Session {
  id: string;
  keyIterationCount: number;
  token: string;
  platform: Platform;
  encryptedPrivateKey: string;
}
