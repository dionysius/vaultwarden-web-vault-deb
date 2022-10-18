import { BaseResponse } from "./base.response";

export class SendFileDownloadDataResponse extends BaseResponse {
  id: string = null;
  url: string = null;
  constructor(response: any) {
    super(response);
    this.id = this.getResponseProperty("Id");
    this.url = this.getResponseProperty("Url");
  }
}
