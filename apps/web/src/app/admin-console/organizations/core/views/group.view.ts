import { View } from "@bitwarden/common/src/models/view/view";

import { GroupDetailsResponse, GroupResponse } from "../services/group/responses/group.response";

import { CollectionAccessSelectionView } from "./collection-access-selection.view";

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
