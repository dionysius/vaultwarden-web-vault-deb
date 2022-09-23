import { EncryptedCommand } from "./encryptedCommand";

export type DecryptedCommandData = {
  command: EncryptedCommand;
  payload?: any;
};
