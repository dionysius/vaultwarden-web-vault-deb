import { Collection } from "../domain/collection";

import { CollectionRequest } from "./collection.request";

export class CollectionWithIdRequest extends CollectionRequest {
  id: string;

  constructor(collection?: Collection) {
    if (collection == null) {
      return;
    }
    super(collection);
    this.id = collection.id;
  }
}
