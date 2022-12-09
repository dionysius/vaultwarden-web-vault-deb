import { View } from "@bitwarden/common/models/view/view";

export class ServiceAccountView implements View {
  id: string;
  organizationId: string;
  name: string;
  creationDate: string;
  revisionDate: string;
}
