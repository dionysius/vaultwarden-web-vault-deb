import { BehaviorSubject } from "rxjs";

import { Send } from "@bitwarden/common/models/domain/send";
import { SendView } from "@bitwarden/common/models/view/send.view";
import { SendService } from "@bitwarden/common/services/send/send.service";

import { browserSession, sessionSync } from "../decorators/session-sync-observable";

@browserSession
export class BrowserSendService extends SendService {
  @sessionSync({ initializer: Send.fromJSON, initializeAs: "array" })
  protected _sends: BehaviorSubject<Send[]>;
  @sessionSync({ initializer: SendView.fromJSON, initializeAs: "array" })
  protected _sendViews: BehaviorSubject<SendView[]>;
}
