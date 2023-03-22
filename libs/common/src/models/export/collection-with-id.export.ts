import { Collection as CollectionDomain } from "../../admin-console/models/domain/collection";
import { CollectionView } from "../../admin-console/models/view/collection.view";

import { CollectionExport } from "./collection.export";

export class CollectionWithIdExport extends CollectionExport {
  id: string;

  // Use build method instead of ctor so that we can control order of JSON stringify for pretty print
  build(o: CollectionView | CollectionDomain) {
    this.id = o.id;
    super.build(o);
  }
}
