import { Collection as CollectionDomain } from "../../vault/models/domain/collection";
import { CollectionView } from "../../vault/models/view/collection.view";

import { CollectionExport } from "./collection.export";

export class CollectionWithIdExport extends CollectionExport {
  id: string;

  static toView(req: CollectionWithIdExport, view = new CollectionView()) {
    view.id = req.id;
    return super.toView(req, view);
  }

  static toDomain(req: CollectionWithIdExport, domain = new CollectionDomain()) {
    domain.id = req.id;
    return super.toDomain(req, domain);
  }

  // Use build method instead of ctor so that we can control order of JSON stringify for pretty print
  build(o: CollectionView | CollectionDomain) {
    this.id = o.id;
    super.build(o);
  }
}
