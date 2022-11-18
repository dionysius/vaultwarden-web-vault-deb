import { BaseResponse } from "./base.response";

export class FileResponse implements BaseResponse {
  object: string;
  data: Buffer;
  fileName: string;

  constructor(data: Buffer, fileName: string) {
    this.object = "file";
    this.data = data;
    this.fileName = fileName;
  }
}
