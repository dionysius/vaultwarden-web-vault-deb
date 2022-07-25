import { BaseResponse } from "./baseResponse";
import { CipherResponse } from "./cipherResponse";
import { CollectionResponse } from "./collectionResponse";
import { ListResponse } from "./listResponse";

export class OrganizationExportResponse extends BaseResponse {
  collections: ListResponse<CollectionResponse>;
  ciphers: ListResponse<CipherResponse>;

  constructor(response: any) {
    super(response);
    this.collections = this.getResponseProperty("Collections");
    this.ciphers = this.getResponseProperty("Ciphers");
  }
}
