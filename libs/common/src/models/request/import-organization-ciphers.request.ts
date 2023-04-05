import { CollectionWithIdRequest } from "../../admin-console/models/request/collection-with-id.request";
import { CipherRequest } from "../../vault/models/request/cipher.request";

import { KvpRequest } from "./kvp.request";

export class ImportOrganizationCiphersRequest {
  ciphers: CipherRequest[] = [];
  collections: CollectionWithIdRequest[] = [];
  collectionRelationships: KvpRequest<number, number>[] = [];
}
