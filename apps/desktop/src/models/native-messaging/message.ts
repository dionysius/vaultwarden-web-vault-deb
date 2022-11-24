import { EncryptedMessage } from "./encrypted-message";
import { UnencryptedMessage } from "./unencrypted-message";

export type Message = UnencryptedMessage | EncryptedMessage;
