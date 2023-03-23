import { CollectionView } from "@bitwarden/common/admin-console/models/view/collection.view";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import { FolderView } from "@bitwarden/common/vault/models/view/folder.view";

export class ImportResult {
  success = false;
  missingPassword = false;
  errorMessage: string;
  ciphers: CipherView[] = [];
  folders: FolderView[] = [];
  folderRelationships: [number, number][] = [];
  collections: CollectionView[] = [];
  collectionRelationships: [number, number][] = [];
}
