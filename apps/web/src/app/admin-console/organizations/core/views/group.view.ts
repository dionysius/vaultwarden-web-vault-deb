import { CollectionAccessSelectionView } from "@bitwarden/admin-console/common";
import { View } from "@bitwarden/common/models/view/view";

import { GroupDetailsResponse, GroupResponse } from "../services/group/responses/group.response";

export class GroupView implements View {
  id: string;
  organizationId: string;
  name: string;
  externalId: string;
  collections: CollectionAccessSelectionView[] = [];
  members: string[] = [];

  static fromResponse(response: GroupResponse): GroupView {
    const view: GroupView = Object.assign(new GroupView(), response) as GroupView;

    if (response instanceof GroupDetailsResponse && response.collections != undefined) {
      view.collections = response.collections.map((c) => new CollectionAccessSelectionView(c));
    }

    return view;
  }
}
