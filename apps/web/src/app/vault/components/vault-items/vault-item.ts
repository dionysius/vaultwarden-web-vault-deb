import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import { CollectionView } from "@bitwarden/common/vault/models/view/collection.view";

export interface VaultItem {
  collection?: CollectionView;
  cipher?: CipherView;
}
