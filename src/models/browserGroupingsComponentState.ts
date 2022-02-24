import { CipherType } from "jslib-common/enums/cipherType";
import { CipherView } from "jslib-common/models/view/cipherView";
import { CollectionView } from "jslib-common/models/view/collectionView";
import { FolderView } from "jslib-common/models/view/folderView";

import { BrowserComponentState } from "./browserComponentState";

export class BrowserGroupingsComponentState extends BrowserComponentState {
  favoriteCiphers: CipherView[];
  noFolderCiphers: CipherView[];
  ciphers: CipherView[];
  collectionCounts: Map<string, number>;
  folderCounts: Map<string, number>;
  typeCounts: Map<CipherType, number>;
  folders: FolderView[];
  collections: CollectionView[];
  deletedCount: number;
}
