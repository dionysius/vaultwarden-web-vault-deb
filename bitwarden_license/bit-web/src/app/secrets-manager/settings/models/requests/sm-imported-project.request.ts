import { EncString } from "@bitwarden/common/platform/models/domain/enc-string";

export class SecretsManagerImportedProjectRequest {
  id: string;
  name: EncString;
}
