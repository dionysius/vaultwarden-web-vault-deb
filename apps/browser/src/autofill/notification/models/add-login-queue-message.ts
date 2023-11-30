import { Utils } from "@bitwarden/common/platform/misc/utils";
import { CipherType } from "@bitwarden/common/vault/enums";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import { LoginUriView } from "@bitwarden/common/vault/models/view/login-uri.view";
import { LoginView } from "@bitwarden/common/vault/models/view/login.view";

import NotificationQueueMessage from "./notification-queue-message";
import { NotificationQueueMessageType } from "./notification-queue-message-type";

export default class AddLoginQueueMessage extends NotificationQueueMessage {
  type: NotificationQueueMessageType.AddLogin;
  username: string;
  password: string;
  uri: string;

  static toCipherView(message: AddLoginQueueMessage, folderId?: string): CipherView {
    const uriView = new LoginUriView();
    uriView.uri = message.uri;

    const loginView = new LoginView();
    loginView.uris = [uriView];
    loginView.username = message.username;
    loginView.password = message.password;

    const cipherView = new CipherView();
    cipherView.name = (Utils.getHostname(message.uri) || message.domain).replace(/^www\./, "");
    cipherView.folderId = folderId;
    cipherView.type = CipherType.Login;
    cipherView.login = loginView;

    return cipherView;
  }
}
