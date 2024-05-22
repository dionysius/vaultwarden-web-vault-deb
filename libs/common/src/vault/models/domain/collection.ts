import Domain from "../../../platform/models/domain/domain-base";
import { EncString } from "../../../platform/models/domain/enc-string";
import { OrgKey } from "../../../types/key";
import { CollectionData } from "../data/collection.data";
import { CollectionView } from "../view/collection.view";

export class Collection extends Domain {
  id: string;
  organizationId: string;
  name: EncString;
  externalId: string;
  readOnly: boolean;
  hidePasswords: boolean;
  manage: boolean;

  constructor(obj?: CollectionData) {
    super();
    if (obj == null) {
      return;
    }

    this.buildDomainModel(
      this,
      obj,
      {
        id: null,
        organizationId: null,
        name: null,
        externalId: null,
        readOnly: null,
        hidePasswords: null,
        manage: null,
      },
      ["id", "organizationId", "externalId", "readOnly", "hidePasswords", "manage"],
    );
  }

  decrypt(orgKey: OrgKey): Promise<CollectionView> {
    return this.decryptObj(
      new CollectionView(this),
      {
        name: null,
      },
      this.organizationId,
      orgKey,
    );
  }
}
