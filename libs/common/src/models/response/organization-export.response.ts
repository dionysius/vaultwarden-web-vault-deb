import { BaseResponse } from "./base.response";
import { CipherResponse } from "./cipher.response";
import { CollectionResponse } from "./collection.response";

export class OrganizationExportResponse extends BaseResponse {
  collections: CollectionResponse[];
  ciphers: CipherResponse[];

  constructor(response: any) {
    super(response);
    const collections = this.getResponseProperty("Collections");
    if (collections != null) {
      this.collections = collections.map((c: any) => new CollectionResponse(c));
    }
    const ciphers = this.getResponseProperty("Ciphers");
    if (ciphers != null) {
      this.ciphers = ciphers.map((c: any) => new CipherResponse(c));
    }
  }
}
