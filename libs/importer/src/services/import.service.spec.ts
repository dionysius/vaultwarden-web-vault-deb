// eslint-disable-next-line no-restricted-imports
import { Substitute, SubstituteOf } from "@fluffy-spoon/substitute";

import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { CollectionService } from "@bitwarden/common/admin-console/abstractions/collection.service";
import { Utils } from "@bitwarden/common/misc/utils";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { FolderService } from "@bitwarden/common/vault/abstractions/folder/folder.service.abstraction";

import { BitwardenPasswordProtectedImporter } from "../importers/bitwarden/bitwarden-password-protected-importer";
import { Importer } from "../importers/importer";

import { ImportApiServiceAbstraction } from "./import-api.service.abstraction";
import { ImportService } from "./import.service";

describe("ImportService", () => {
  let importService: ImportService;
  let cipherService: SubstituteOf<CipherService>;
  let folderService: SubstituteOf<FolderService>;
  let importApiService: SubstituteOf<ImportApiServiceAbstraction>;
  let i18nService: SubstituteOf<I18nService>;
  let collectionService: SubstituteOf<CollectionService>;
  let cryptoService: SubstituteOf<CryptoService>;

  beforeEach(() => {
    cipherService = Substitute.for<CipherService>();
    folderService = Substitute.for<FolderService>();
    importApiService = Substitute.for<ImportApiServiceAbstraction>();
    i18nService = Substitute.for<I18nService>();
    collectionService = Substitute.for<CollectionService>();
    cryptoService = Substitute.for<CryptoService>();

    importService = new ImportService(
      cipherService,
      folderService,
      importApiService,
      i18nService,
      collectionService,
      cryptoService
    );
  });

  describe("getImporterInstance", () => {
    describe("Get bitPasswordProtected importer", () => {
      let importer: Importer;
      const organizationId = Utils.newGuid();
      const password = Utils.newGuid();

      beforeEach(() => {
        importer = importService.getImporter(
          "bitwardenpasswordprotected",
          organizationId,
          password
        );
      });

      it("returns an instance of BitwardenPasswordProtectedImporter", () => {
        expect(importer).toBeInstanceOf(BitwardenPasswordProtectedImporter);
      });

      it("has the appropriate organization Id", () => {
        expect(importer.organizationId).toEqual(organizationId);
      });

      it("has the appropriate password", () => {
        expect(Object.entries(importer)).toEqual(expect.arrayContaining([["password", password]]));
      });
    });
  });
});
