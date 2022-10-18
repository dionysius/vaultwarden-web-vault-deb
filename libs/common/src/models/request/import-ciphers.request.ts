import { CipherRequest } from "./cipher.request";
import { FolderRequest } from "./folder.request";
import { KvpRequest } from "./kvp.request";

export class ImportCiphersRequest {
  ciphers: CipherRequest[] = [];
  folders: FolderRequest[] = [];
  folderRelationships: KvpRequest<number, number>[] = [];
}
