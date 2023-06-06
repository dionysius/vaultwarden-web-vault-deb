import { BehaviorSubject } from "rxjs";

import { Send } from "@bitwarden/common/tools/send/models/domain/send";
import { SendView } from "@bitwarden/common/tools/send/models/view/send.view";
import { SendService } from "@bitwarden/common/tools/send/services/send.service";

import { browserSession, sessionSync } from "../platform/decorators/session-sync-observable";

@browserSession
export class BrowserSendService extends SendService {
  @sessionSync({ initializer: Send.fromJSON, initializeAs: "array" })
  protected _sends: BehaviorSubject<Send[]>;
  @sessionSync({ initializer: SendView.fromJSON, initializeAs: "array" })
  protected _sendViews: BehaviorSubject<SendView[]>;
}
