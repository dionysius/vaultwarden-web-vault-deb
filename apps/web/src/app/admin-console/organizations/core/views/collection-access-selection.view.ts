import { View } from "@bitwarden/common/models/view/view";

interface SelectionResponseLike {
  id: string;
  readOnly: boolean;
  hidePasswords: boolean;
}

export class CollectionAccessSelectionView extends View {
  readonly id: string;
  readonly readOnly: boolean;
  readonly hidePasswords: boolean;

  constructor(response?: SelectionResponseLike) {
    super();

    if (!response) {
      return;
    }

    this.id = response.id;
    this.readOnly = response.readOnly;
    this.hidePasswords = response.hidePasswords;
  }
}
