import { CipherWithIdRequest } from "../../vault/models/request/cipher-with-id.request";
import { FolderWithIdRequest } from "../../vault/models/request/folder-with-id.request";

import { SendWithIdRequest } from "./send-with-id.request";

export class UpdateKeyRequest {
  ciphers: CipherWithIdRequest[] = [];
  folders: FolderWithIdRequest[] = [];
  sends: SendWithIdRequest[] = [];
  masterPasswordHash: string;
  privateKey: string;
  key: string;
}
