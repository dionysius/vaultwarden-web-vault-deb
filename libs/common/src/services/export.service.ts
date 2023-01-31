import * as papa from "papaparse";

import { ApiService } from "../abstractions/api.service";
import { CryptoService } from "../abstractions/crypto.service";
import { CryptoFunctionService } from "../abstractions/cryptoFunction.service";
import {
  ExportFormat,
  ExportService as ExportServiceAbstraction,
} from "../abstractions/export.service";
import { DEFAULT_PBKDF2_ITERATIONS, KdfType } from "../enums/kdfType";
import { Utils } from "../misc/utils";
import { CollectionData } from "../models/data/collection.data";
import { Collection } from "../models/domain/collection";
import { KdfConfig } from "../models/domain/kdf-config";
import { CipherWithIdExport as CipherExport } from "../models/export/cipher-with-ids.export";
import { CollectionWithIdExport as CollectionExport } from "../models/export/collection-with-id.export";
import { EventExport } from "../models/export/event.export";
import { FolderWithIdExport as FolderExport } from "../models/export/folder-with-id.export";
import { CollectionDetailsResponse } from "../models/response/collection.response";
import { CollectionView } from "../models/view/collection.view";
import { EventView } from "../models/view/event.view";
import { CipherService } from "../vault/abstractions/cipher.service";
import { FolderService } from "../vault/abstractions/folder/folder.service.abstraction";
import { CipherType } from "../vault/enums/cipher-type";
import { CipherData } from "../vault/models/data/cipher.data";
import { Cipher } from "../vault/models/domain/cipher";
import { Folder } from "../vault/models/domain/folder";
import { CipherView } from "../vault/models/view/cipher.view";
import { FolderView } from "../vault/models/view/folder.view";

export class ExportService implements ExportServiceAbstraction {
  constructor(
    private folderService: FolderService,
    private cipherService: CipherService,
    private apiService: ApiService,
    private cryptoService: CryptoService,
    private cryptoFunctionService: CryptoFunctionService
  ) {}

  async getExport(format: ExportFormat = "csv", organizationId?: string): Promise<string> {
    if (organizationId) {
      return await this.getOrganizationExport(organizationId, format);
    }

    if (format === "encrypted_json") {
      return this.getEncryptedExport();
    } else {
      return this.getDecryptedExport(format);
    }
  }

  async getPasswordProtectedExport(password: string, organizationId?: string): Promise<string> {
    const clearText = organizationId
      ? await this.getOrganizationExport(organizationId, "json")
      : await this.getExport("json");

    const salt = Utils.fromBufferToB64(await this.cryptoFunctionService.randomBytes(16));
    const kdfConfig = new KdfConfig(DEFAULT_PBKDF2_ITERATIONS);
    const key = await this.cryptoService.makePinKey(
      password,
      salt,
      KdfType.PBKDF2_SHA256,
      kdfConfig
    );

    const encKeyValidation = await this.cryptoService.encrypt(Utils.newGuid(), key);
    const encText = await this.cryptoService.encrypt(clearText, key);

    const jsonDoc: any = {
      encrypted: true,
      passwordProtected: true,
      salt: salt,
      kdfIterations: kdfConfig.iterations,
      kdfType: KdfType.PBKDF2_SHA256,
      encKeyValidation_DO_NOT_EDIT: encKeyValidation.encryptedString,
      data: encText.encryptedString,
    };

    return JSON.stringify(jsonDoc, null, "  ");
  }

  async getOrganizationExport(
    organizationId: string,
    format: ExportFormat = "csv"
  ): Promise<string> {
    if (format === "encrypted_json") {
      return this.getOrganizationEncryptedExport(organizationId);
    } else {
      return this.getOrganizationDecryptedExport(organizationId, format);
    }
  }

  async getEventExport(events: EventView[]): Promise<string> {
    return papa.unparse(events.map((e) => new EventExport(e)));
  }

  getFileName(prefix: string = null, extension = "csv"): string {
    const now = new Date();
    const dateString =
      now.getFullYear() +
      "" +
      this.padNumber(now.getMonth() + 1, 2) +
      "" +
      this.padNumber(now.getDate(), 2) +
      this.padNumber(now.getHours(), 2) +
      "" +
      this.padNumber(now.getMinutes(), 2) +
      this.padNumber(now.getSeconds(), 2);

    return "bitwarden" + (prefix ? "_" + prefix : "") + "_export_" + dateString + "." + extension;
  }

  private async getDecryptedExport(format: "json" | "csv"): Promise<string> {
    let decFolders: FolderView[] = [];
    let decCiphers: CipherView[] = [];
    const promises = [];

    promises.push(
      this.folderService.getAllDecryptedFromState().then((folders) => {
        decFolders = folders;
      })
    );

    promises.push(
      this.cipherService.getAllDecrypted().then((ciphers) => {
        decCiphers = ciphers.filter((f) => f.deletedDate == null);
      })
    );

    await Promise.all(promises);

    if (format === "csv") {
      const foldersMap = new Map<string, FolderView>();
      decFolders.forEach((f) => {
        if (f.id != null) {
          foldersMap.set(f.id, f);
        }
      });

      const exportCiphers: any[] = [];
      decCiphers.forEach((c) => {
        // only export logins and secure notes
        if (c.type !== CipherType.Login && c.type !== CipherType.SecureNote) {
          return;
        }
        if (c.organizationId != null) {
          return;
        }

        const cipher: any = {};
        cipher.folder =
          c.folderId != null && foldersMap.has(c.folderId) ? foldersMap.get(c.folderId).name : null;
        cipher.favorite = c.favorite ? 1 : null;
        this.buildCommonCipher(cipher, c);
        exportCiphers.push(cipher);
      });

      return papa.unparse(exportCiphers);
    } else {
      const jsonDoc: any = {
        encrypted: false,
        folders: [],
        items: [],
      };

      decFolders.forEach((f) => {
        if (f.id == null) {
          return;
        }
        const folder = new FolderExport();
        folder.build(f);
        jsonDoc.folders.push(folder);
      });

      decCiphers.forEach((c) => {
        if (c.organizationId != null) {
          return;
        }
        const cipher = new CipherExport();
        cipher.build(c);
        cipher.collectionIds = null;
        jsonDoc.items.push(cipher);
      });

      return JSON.stringify(jsonDoc, null, "  ");
    }
  }

  private async getEncryptedExport(): Promise<string> {
    let folders: Folder[] = [];
    let ciphers: Cipher[] = [];
    const promises = [];

    promises.push(
      this.folderService.getAllFromState().then((f) => {
        folders = f;
      })
    );

    promises.push(
      this.cipherService.getAll().then((c) => {
        ciphers = c.filter((f) => f.deletedDate == null);
      })
    );

    await Promise.all(promises);

    const encKeyValidation = await this.cryptoService.encrypt(Utils.newGuid());

    const jsonDoc: any = {
      encrypted: true,
      encKeyValidation_DO_NOT_EDIT: encKeyValidation.encryptedString,
      folders: [],
      items: [],
    };

    folders.forEach((f) => {
      if (f.id == null) {
        return;
      }
      const folder = new FolderExport();
      folder.build(f);
      jsonDoc.folders.push(folder);
    });

    ciphers.forEach((c) => {
      if (c.organizationId != null) {
        return;
      }
      const cipher = new CipherExport();
      cipher.build(c);
      cipher.collectionIds = null;
      jsonDoc.items.push(cipher);
    });

    return JSON.stringify(jsonDoc, null, "  ");
  }

  private async getOrganizationDecryptedExport(
    organizationId: string,
    format: "json" | "csv"
  ): Promise<string> {
    const decCollections: CollectionView[] = [];
    const decCiphers: CipherView[] = [];
    const promises = [];

    promises.push(
      this.apiService.getOrganizationExport(organizationId).then((exportData) => {
        const exportPromises: any = [];
        if (exportData != null) {
          if (exportData.collections != null && exportData.collections.length > 0) {
            exportData.collections.forEach((c) => {
              const collection = new Collection(new CollectionData(c as CollectionDetailsResponse));
              exportPromises.push(
                collection.decrypt().then((decCol) => {
                  decCollections.push(decCol);
                })
              );
            });
          }
          if (exportData.ciphers != null && exportData.ciphers.length > 0) {
            exportData.ciphers
              .filter((c) => c.deletedDate === null)
              .forEach((c) => {
                const cipher = new Cipher(new CipherData(c));
                exportPromises.push(
                  cipher.decrypt().then((decCipher) => {
                    decCiphers.push(decCipher);
                  })
                );
              });
          }
        }
        return Promise.all(exportPromises);
      })
    );

    await Promise.all(promises);

    if (format === "csv") {
      const collectionsMap = new Map<string, CollectionView>();
      decCollections.forEach((c) => {
        collectionsMap.set(c.id, c);
      });

      const exportCiphers: any[] = [];
      decCiphers.forEach((c) => {
        // only export logins and secure notes
        if (c.type !== CipherType.Login && c.type !== CipherType.SecureNote) {
          return;
        }

        const cipher: any = {};
        cipher.collections = [];
        if (c.collectionIds != null) {
          cipher.collections = c.collectionIds
            .filter((id) => collectionsMap.has(id))
            .map((id) => collectionsMap.get(id).name);
        }
        this.buildCommonCipher(cipher, c);
        exportCiphers.push(cipher);
      });

      return papa.unparse(exportCiphers);
    } else {
      const jsonDoc: any = {
        encrypted: false,
        collections: [],
        items: [],
      };

      decCollections.forEach((c) => {
        const collection = new CollectionExport();
        collection.build(c);
        jsonDoc.collections.push(collection);
      });

      decCiphers.forEach((c) => {
        const cipher = new CipherExport();
        cipher.build(c);
        jsonDoc.items.push(cipher);
      });
      return JSON.stringify(jsonDoc, null, "  ");
    }
  }

  private async getOrganizationEncryptedExport(organizationId: string): Promise<string> {
    const collections: Collection[] = [];
    const ciphers: Cipher[] = [];
    const promises = [];

    promises.push(
      this.apiService.getCollections(organizationId).then((c) => {
        const collectionPromises: any = [];
        if (c != null && c.data != null && c.data.length > 0) {
          c.data.forEach((r) => {
            const collection = new Collection(new CollectionData(r as CollectionDetailsResponse));
            collections.push(collection);
          });
        }
        return Promise.all(collectionPromises);
      })
    );

    promises.push(
      this.apiService.getCiphersOrganization(organizationId).then((c) => {
        const cipherPromises: any = [];
        if (c != null && c.data != null && c.data.length > 0) {
          c.data
            .filter((item) => item.deletedDate === null)
            .forEach((item) => {
              const cipher = new Cipher(new CipherData(item));
              ciphers.push(cipher);
            });
        }
        return Promise.all(cipherPromises);
      })
    );

    await Promise.all(promises);

    const orgKey = await this.cryptoService.getOrgKey(organizationId);
    const encKeyValidation = await this.cryptoService.encrypt(Utils.newGuid(), orgKey);

    const jsonDoc: any = {
      encrypted: true,
      encKeyValidation_DO_NOT_EDIT: encKeyValidation.encryptedString,
      collections: [],
      items: [],
    };

    collections.forEach((c) => {
      const collection = new CollectionExport();
      collection.build(c);
      jsonDoc.collections.push(collection);
    });

    ciphers.forEach((c) => {
      const cipher = new CipherExport();
      cipher.build(c);
      jsonDoc.items.push(cipher);
    });
    return JSON.stringify(jsonDoc, null, "  ");
  }

  private padNumber(num: number, width: number, padCharacter = "0"): string {
    const numString = num.toString();
    return numString.length >= width
      ? numString
      : new Array(width - numString.length + 1).join(padCharacter) + numString;
  }

  private buildCommonCipher(cipher: any, c: CipherView) {
    cipher.type = null;
    cipher.name = c.name;
    cipher.notes = c.notes;
    cipher.fields = null;
    cipher.reprompt = c.reprompt;
    // Login props
    cipher.login_uri = null;
    cipher.login_username = null;
    cipher.login_password = null;
    cipher.login_totp = null;

    if (c.fields) {
      c.fields.forEach((f: any) => {
        if (!cipher.fields) {
          cipher.fields = "";
        } else {
          cipher.fields += "\n";
        }

        cipher.fields += (f.name || "") + ": " + f.value;
      });
    }

    switch (c.type) {
      case CipherType.Login:
        cipher.type = "login";
        cipher.login_username = c.login.username;
        cipher.login_password = c.login.password;
        cipher.login_totp = c.login.totp;

        if (c.login.uris) {
          cipher.login_uri = [];
          c.login.uris.forEach((u) => {
            cipher.login_uri.push(u.uri);
          });
        }
        break;
      case CipherType.SecureNote:
        cipher.type = "note";
        break;
      default:
        return;
    }

    return cipher;
  }
}
