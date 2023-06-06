import { EncString } from "@bitwarden/common/platform/models/domain/enc-string";

export class SecretsManagerImportedSecretRequest {
  id: string;
  key: EncString;
  value: EncString;
  note: EncString;
  projectIds: string[];
}
