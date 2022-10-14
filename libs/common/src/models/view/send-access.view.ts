import { SendType } from "../../enums/sendType";
import { SendAccess } from "../domain/send-access";

import { SendFileView } from "./send-file.view";
import { SendTextView } from "./send-text.view";
import { View } from "./view";

export class SendAccessView implements View {
  id: string = null;
  name: string = null;
  type: SendType = null;
  text = new SendTextView();
  file = new SendFileView();
  expirationDate: Date = null;
  creatorIdentifier: string = null;

  constructor(s?: SendAccess) {
    if (!s) {
      return;
    }

    this.id = s.id;
    this.type = s.type;
    this.expirationDate = s.expirationDate;
    this.creatorIdentifier = s.creatorIdentifier;
  }
}
