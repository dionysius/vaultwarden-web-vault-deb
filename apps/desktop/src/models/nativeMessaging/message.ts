import { EncryptedMessage } from "./encryptedMessage";
import { UnencryptedMessage } from "./unencryptedMessage";

export type Message = UnencryptedMessage | EncryptedMessage;
