import { SecretsManagerImportErrorLine } from "./sm-import-error-line";

export class SecretsManagerImportError extends Error {
  constructor(message?: string) {
    super(message);
  }

  lines: SecretsManagerImportErrorLine[];
}
