import { View } from "@bitwarden/common/models/view/view";

export class AccessTokenView implements View {
  id: string;
  name: string;
  scopes: string[];
  expireAt?: Date;
  creationDate: Date;
  revisionDate: Date;
}
