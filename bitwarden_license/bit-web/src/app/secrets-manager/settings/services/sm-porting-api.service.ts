import { Injectable } from "@angular/core";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { EncryptService } from "@bitwarden/common/abstractions/encrypt.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { EncString } from "@bitwarden/common/models/domain/enc-string";
import { ErrorResponse } from "@bitwarden/common/models/response/error.response";

import { SecretsManagerImportError } from "../models/error/sm-import-error";
import { SecretsManagerImportRequest } from "../models/requests/sm-import.request";
import { SecretsManagerImportedProjectRequest } from "../models/requests/sm-imported-project.request";
import { SecretsManagerImportedSecretRequest } from "../models/requests/sm-imported-secret.request";
import { SecretsManagerExportResponse } from "../models/responses/sm-export.response";
import {
  SecretsManagerExport,
  SecretsManagerExportProject,
  SecretsManagerExportSecret,
} from "../models/sm-export";

@Injectable({
  providedIn: "root",
})
export class SecretsManagerPortingApiService {
  constructor(
    private apiService: ApiService,
    private encryptService: EncryptService,
    private cryptoService: CryptoService,
    private i18nService: I18nService
  ) {}

  async export(organizationId: string, exportFormat = "json"): Promise<string> {
    let response = {};

    try {
      response = await this.apiService.send(
        "GET",
        "/sm/" + organizationId + "/export?format=" + exportFormat,
        null,
        true,
        true
      );
    } catch (error) {
      return null;
    }

    return JSON.stringify(
      await this.decryptExport(organizationId, new SecretsManagerExportResponse(response)),
      null,
      "  "
    );
  }

  async import(organizationId: string, fileContents: string): Promise<SecretsManagerImportError> {
    let requestObject = {};

    try {
      requestObject = JSON.parse(fileContents);
      const requestBody = await this.encryptImport(organizationId, requestObject);

      await this.apiService.send(
        "POST",
        "/sm/" + organizationId + "/import",
        requestBody,
        true,
        true
      );
    } catch (error) {
      const errorResponse = new ErrorResponse(error, 400);
      return this.handleServerError(errorResponse, requestObject);
    }
  }

  private async encryptImport(
    organizationId: string,
    importData: any
  ): Promise<SecretsManagerImportRequest> {
    const encryptedImport = new SecretsManagerImportRequest();

    try {
      const orgKey = await this.cryptoService.getOrgKey(organizationId);
      encryptedImport.projects = [];
      encryptedImport.secrets = [];

      encryptedImport.projects = await Promise.all(
        importData.projects.map(async (p: any) => {
          const project = new SecretsManagerImportedProjectRequest();
          project.id = p.id;
          project.name = await this.encryptService.encrypt(p.name, orgKey);
          return project;
        })
      );

      encryptedImport.secrets = await Promise.all(
        importData.secrets.map(async (s: any) => {
          const secret = new SecretsManagerImportedSecretRequest();

          [secret.key, secret.value, secret.note] = await Promise.all([
            this.encryptService.encrypt(s.key, orgKey),
            this.encryptService.encrypt(s.value, orgKey),
            this.encryptService.encrypt(s.note, orgKey),
          ]);

          secret.id = s.id;
          secret.projectIds = s.projectIds;

          return secret;
        })
      );
    } catch (error) {
      return null;
    }

    return encryptedImport;
  }

  private async decryptExport(
    organizationId: string,
    exportData: SecretsManagerExportResponse
  ): Promise<SecretsManagerExport> {
    const orgKey = await this.cryptoService.getOrgKey(organizationId);
    const decryptedExport = new SecretsManagerExport();
    decryptedExport.projects = [];
    decryptedExport.secrets = [];

    decryptedExport.projects = await Promise.all(
      exportData.projects.map(async (p) => {
        const project = new SecretsManagerExportProject();
        project.id = p.id;
        project.name = await this.encryptService.decryptToUtf8(new EncString(p.name), orgKey);
        return project;
      })
    );

    decryptedExport.secrets = await Promise.all(
      exportData.secrets.map(async (s) => {
        const secret = new SecretsManagerExportSecret();

        [secret.key, secret.value, secret.note] = await Promise.all([
          this.encryptService.decryptToUtf8(new EncString(s.key), orgKey),
          this.encryptService.decryptToUtf8(new EncString(s.value), orgKey),
          this.encryptService.decryptToUtf8(new EncString(s.note), orgKey),
        ]);

        secret.id = s.id;
        secret.projectIds = s.projectIds;

        return secret;
      })
    );

    return decryptedExport;
  }

  private handleServerError(
    errorResponse: ErrorResponse,
    importResult: any
  ): SecretsManagerImportError {
    if (errorResponse.validationErrors == null) {
      return new SecretsManagerImportError(errorResponse.message);
    }

    const result = new SecretsManagerImportError();
    result.lines = [];

    Object.entries(errorResponse.validationErrors).forEach(([key, value], index) => {
      let item;
      let itemType;
      const id = Number(key.match(/[0-9]+/)[0]);

      switch (key.match(/^\w+/)[0]) {
        case "Projects":
          item = importResult.projects[id];
          itemType = "Project";
          break;
        case "Secrets":
          item = importResult.secrets[id];
          itemType = "Secret";
          break;
        default:
          return;
      }

      result.lines.push({
        id: id + 1,
        type: itemType == "Project" ? "Project" : "Secret",
        key: item.key,
        errorMessage: value.length > 0 ? value[0] : "",
      });
    });

    return result;
  }
}
