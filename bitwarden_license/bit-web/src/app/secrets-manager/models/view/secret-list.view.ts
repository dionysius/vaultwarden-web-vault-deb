import { SecretProjectView } from "./secret-project.view";

export class SecretListView {
  id: string;
  organizationId: string;
  name: string;
  creationDate: string;
  revisionDate: string;
  projects: SecretProjectView[];
}
