import { EncryptedCommand } from "./encrypted-command";

export type DecryptedCommandData = {
  command: EncryptedCommand;
  payload?: any;
};
