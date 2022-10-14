import { CipherView } from "../view/cipher.view";
import { CollectionView } from "../view/collection.view";
import { FolderView } from "../view/folder.view";

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
