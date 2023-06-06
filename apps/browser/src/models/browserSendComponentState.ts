import { Utils } from "@bitwarden/common/platform/misc/utils";
import { SendType } from "@bitwarden/common/tools/send/enums/send-type";
import { SendView } from "@bitwarden/common/tools/send/models/view/send.view";
import { DeepJsonify } from "@bitwarden/common/types/deep-jsonify";

import { BrowserComponentState } from "./browserComponentState";

export class BrowserSendComponentState extends BrowserComponentState {
  sends: SendView[];
  typeCounts: Map<SendType, number>;

  toJSON() {
    return Utils.merge(this, {
      typeCounts: Utils.mapToRecord(this.typeCounts),
    });
  }

  static fromJSON(json: DeepJsonify<BrowserSendComponentState>) {
    if (json == null) {
      return null;
    }

    return Object.assign(new BrowserSendComponentState(), json, {
      sends: json.sends?.map((s) => SendView.fromJSON(s)),
      typeCounts: Utils.recordToMap(json.typeCounts),
    });
  }
}
