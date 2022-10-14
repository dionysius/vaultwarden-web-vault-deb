import { CollectionView } from "@bitwarden/common/models/view/collection.view";

import { SelectionReadOnly } from "../selectionReadOnly";

import { CollectionResponse } from "./collectionResponse";

export class OrganizationCollectionResponse extends CollectionResponse {
  groups: SelectionReadOnly[];

  constructor(o: CollectionView, groups: SelectionReadOnly[]) {
    super(o);
    this.object = "org-collection";
    this.groups = groups;
  }
}
