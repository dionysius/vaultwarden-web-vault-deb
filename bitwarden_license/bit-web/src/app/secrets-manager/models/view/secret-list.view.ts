import { View } from "@bitwarden/common/models/view/view";

import { SecretProjectView } from "./secret-project.view";

export class SecretListView implements View {
  id: string;
  organizationId: string;
  name: string;
  creationDate: string;
  revisionDate: string;
  projects: SecretProjectView[];
}
