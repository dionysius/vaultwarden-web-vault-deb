import { BaseResponse } from "../response/base.response";

export class SendTextApi extends BaseResponse {
  text: string;
  hidden: boolean;

  constructor(data: any = null) {
    super(data);
    if (data == null) {
      return;
    }
    this.text = this.getResponseProperty("Text");
    this.hidden = this.getResponseProperty("Hidden") || false;
  }
}
