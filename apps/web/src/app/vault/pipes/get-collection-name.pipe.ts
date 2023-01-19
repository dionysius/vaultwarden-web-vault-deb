import { Pipe, PipeTransform } from "@angular/core";

import { CollectionView } from "@bitwarden/common/src/models/view/collection.view";

@Pipe({
  name: "collectionNameFromId",
  pure: true,
})
export class GetCollectionNameFromIdPipe implements PipeTransform {
  transform(value: string, collections: CollectionView[]) {
    return collections.find((o) => o.id === value)?.name;
  }
}
