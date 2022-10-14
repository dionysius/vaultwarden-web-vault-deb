import { TreeNode } from "@bitwarden/common/models/domain/tree-node";
import { CollectionView } from "@bitwarden/common/models/view/collection.view";
import { FolderView } from "@bitwarden/common/models/view/folder.view";

export class DynamicTreeNode<T extends CollectionView | FolderView> {
  fullList: T[];
  nestedList: TreeNode<T>[];

  hasId(id: string): boolean {
    return this.fullList != null && this.fullList.filter((i: T) => i.id === id).length > 0;
  }

  constructor(init?: Partial<DynamicTreeNode<T>>) {
    Object.assign(this, init);
  }
}
