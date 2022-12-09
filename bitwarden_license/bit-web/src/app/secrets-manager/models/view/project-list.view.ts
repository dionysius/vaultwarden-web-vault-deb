import { View } from "@bitwarden/common/models/view/view";

export class ProjectListView implements View {
  id: string;
  organizationId: string;
  name: string;
  creationDate: string;
  revisionDate: string;
}
