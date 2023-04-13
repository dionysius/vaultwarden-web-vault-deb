import { CollectionView } from "@bitwarden/common/admin-console/models/view/collection.view";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";

export interface VaultItem {
  collection?: CollectionView;
  cipher?: CipherView;
}
