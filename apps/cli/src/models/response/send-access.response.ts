import { SendType } from "@bitwarden/common/enums/sendType";
import { SendAccessView } from "@bitwarden/common/models/view/send-access.view";

import { BaseResponse } from "./base.response";
import { SendFileResponse } from "./send-file.response";
import { SendTextResponse } from "./send-text.response";

export class SendAccessResponse implements BaseResponse {
  static template(): SendAccessResponse {
    const req = new SendAccessResponse();
    req.name = "Send name";
    req.type = SendType.Text;
    req.text = null;
    req.file = null;
    return req;
  }

  object = "send-access";
  id: string;
  name: string;
  type: SendType;
  text: SendTextResponse;
  file: SendFileResponse;

  constructor(o?: SendAccessView) {
    if (o == null) {
      return;
    }
    this.id = o.id;
    this.name = o.name;
    this.type = o.type;

    if (o.type === SendType.Text && o.text != null) {
      this.text = new SendTextResponse(o.text);
    }
    if (o.type === SendType.File && o.file != null) {
      this.file = new SendFileResponse(o.file);
    }
  }
}
