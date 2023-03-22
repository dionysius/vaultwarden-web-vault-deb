import { CollectionRequest } from "../../admin-console/models/request/collection.request";
import { CipherRequest } from "../../vault/models/request/cipher.request";

import { KvpRequest } from "./kvp.request";

export class ImportOrganizationCiphersRequest {
  ciphers: CipherRequest[] = [];
  collections: CollectionRequest[] = [];
  collectionRelationships: KvpRequest<number, number>[] = [];
}
