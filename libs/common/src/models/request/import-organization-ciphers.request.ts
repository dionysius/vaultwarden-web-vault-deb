import { CipherRequest } from "../../vault/models/request/cipher.request";

import { CollectionRequest } from "./collection.request";
import { KvpRequest } from "./kvp.request";

export class ImportOrganizationCiphersRequest {
  ciphers: CipherRequest[] = [];
  collections: CollectionRequest[] = [];
  collectionRelationships: KvpRequest<number, number>[] = [];
}
