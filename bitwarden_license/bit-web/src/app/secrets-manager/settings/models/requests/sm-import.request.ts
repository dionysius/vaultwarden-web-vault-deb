import { SecretsManagerImportedProjectRequest } from "./sm-imported-project.request";
import { SecretsManagerImportedSecretRequest } from "./sm-imported-secret.request";

export class SecretsManagerImportRequest {
  projects: SecretsManagerImportedProjectRequest[];
  secrets: SecretsManagerImportedSecretRequest[];
}
