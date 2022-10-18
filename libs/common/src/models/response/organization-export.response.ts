import { BaseResponse } from "./base.response";
import { CipherResponse } from "./cipher.response";
import { CollectionResponse } from "./collection.response";
import { ListResponse } from "./list.response";

export class OrganizationExportResponse extends BaseResponse {
  collections: ListResponse<CollectionResponse>;
  ciphers: ListResponse<CipherResponse>;

  constructor(response: any) {
    super(response);
    this.collections = this.getResponseProperty("Collections");
    this.ciphers = this.getResponseProperty("Ciphers");
  }
}
