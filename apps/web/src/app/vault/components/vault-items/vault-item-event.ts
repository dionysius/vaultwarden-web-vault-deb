import { CollectionView } from "@bitwarden/common/src/vault/models/view/collection.view";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";

import { VaultItem } from "./vault-item";

export type VaultItemEvent =
  | { type: "viewAttachments"; item: CipherView }
  | { type: "viewCipherCollections"; item: CipherView }
  | { type: "bulkEditCollectionAccess"; items: CollectionView[] }
  | { type: "viewCollectionAccess"; item: CollectionView; readonly: boolean }
  | { type: "viewEvents"; item: CipherView }
  | { type: "editCollection"; item: CollectionView; readonly: boolean }
  | { type: "clone"; item: CipherView }
  | { type: "restore"; items: CipherView[] }
  | { type: "delete"; items: VaultItem[] }
  | { type: "copyField"; item: CipherView; field: "username" | "password" | "totp" }
  | { type: "moveToFolder"; items: CipherView[] }
  | { type: "moveToOrganization"; items: CipherView[] }
  | { type: "assignToCollections"; items: CipherView[] };
