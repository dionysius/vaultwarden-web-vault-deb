import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { ProductType } from "@bitwarden/common/enums";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import { CollectionView } from "@bitwarden/common/vault/models/view/collection.view";

/**
 * Extended cipher view for the popup. Includes the associated collections and organization
 * if applicable.
 */
export class PopupCipherView extends CipherView {
  collections?: CollectionView[];
  organization?: Organization;

  constructor(
    cipher: CipherView,
    collections: CollectionView[] = null,
    organization: Organization = null,
  ) {
    super();
    Object.assign(this, cipher);
    this.collections = collections;
    this.organization = organization;
  }

  /**
   * Get the bwi icon for the cipher according to the organization type.
   */
  get orgIcon(): "bwi-family" | "bwi-business" | null {
    switch (this.organization?.planProductType) {
      case ProductType.Free:
      case ProductType.Families:
        return "bwi-family";
      case ProductType.Teams:
      case ProductType.Enterprise:
      case ProductType.TeamsStarter:
        return "bwi-business";
      default:
        return null;
    }
  }
}
