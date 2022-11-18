import { BaseResponse } from "./base.response";

export class ListResponse implements BaseResponse {
  object: string;
  data: BaseResponse[];

  constructor(data: BaseResponse[]) {
    this.object = "list";
    this.data = data;
  }
}
