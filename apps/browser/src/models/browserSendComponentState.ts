import { SendType } from "jslib-common/enums/sendType";
import { SendView } from "jslib-common/models/view/sendView";

import { BrowserComponentState } from "./browserComponentState";

export class BrowserSendComponentState extends BrowserComponentState {
  sends: SendView[];
  typeCounts: Map<SendType, number>;
}
