import { ITreeNodeObject } from "../../../models/domain/tree-node";
import { View } from "../../../models/view/view";
import { Collection } from "../domain/collection";
import { CollectionAccessDetailsResponse } from "../response/collection.response";

export const NestingDelimiter = "/";

export class CollectionView implements View, ITreeNodeObject {
  id: string = null;
  organizationId: string = null;
  name: string = null;
  externalId: string = null;
  readOnly: boolean = null;
  hidePasswords: boolean = null;

  constructor(c?: Collection | CollectionAccessDetailsResponse) {
    if (!c) {
      return;
    }

    this.id = c.id;
    this.organizationId = c.organizationId;
    this.externalId = c.externalId;
    if (c instanceof Collection) {
      this.readOnly = c.readOnly;
      this.hidePasswords = c.hidePasswords;
    }
  }
}
