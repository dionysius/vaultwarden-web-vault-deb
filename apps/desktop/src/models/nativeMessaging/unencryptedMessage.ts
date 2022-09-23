import { MessageCommon } from "./messageCommon";
import { UnencryptedCommand } from "./unencryptedCommand";

export type UnencryptedMessage = MessageCommon & {
  command: UnencryptedCommand;
  payload: {
    publicKey: string;
    applicationName: string;
  };
};
