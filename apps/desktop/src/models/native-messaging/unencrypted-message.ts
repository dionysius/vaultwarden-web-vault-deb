import { MessageCommon } from "./message-common";
import { UnencryptedCommand } from "./unencrypted-command";

export type UnencryptedMessage = MessageCommon & {
  command: UnencryptedCommand;
  payload: {
    publicKey: string;
    applicationName: string;
  };
};
