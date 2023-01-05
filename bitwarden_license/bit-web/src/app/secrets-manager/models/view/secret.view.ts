import { View } from "@bitwarden/common/models/view/view";

import { SecretProjectView } from "./secret-project.view";

export class SecretView implements View {
  id: string;
  organizationId: string;
  name: string;
  value: string;
  note: string;
  creationDate: string;
  revisionDate: string;
  projects: SecretProjectView[];
}
