import { SendWithIdRequest } from "../../tools/send/models/request/send-with-id.request";
import { CipherWithIdRequest } from "../../vault/models/request/cipher-with-id.request";
import { FolderWithIdRequest } from "../../vault/models/request/folder-with-id.request";

export class UpdateKeyRequest {
  ciphers: CipherWithIdRequest[] = [];
  folders: FolderWithIdRequest[] = [];
  sends: SendWithIdRequest[] = [];
  masterPasswordHash: string;
  privateKey: string;
  key: string;
}
