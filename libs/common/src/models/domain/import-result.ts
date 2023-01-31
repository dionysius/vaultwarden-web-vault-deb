import { CipherView } from "../../vault/models/view/cipher.view";
import { FolderView } from "../../vault/models/view/folder.view";
import { CollectionView } from "../view/collection.view";

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
