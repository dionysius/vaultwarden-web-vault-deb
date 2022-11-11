// eslint-disable-next-line no-restricted-imports
import { Substitute, SubstituteOf } from "@fluffy-spoon/substitute";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { CipherService } from "@bitwarden/common/abstractions/cipher.service";
import { CollectionService } from "@bitwarden/common/abstractions/collection.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { FolderService } from "@bitwarden/common/abstractions/folder/folder.service.abstraction";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { BitwardenPasswordProtectedImporter } from "@bitwarden/common/importers/bitwarden-password-protected-importer";
import { Importer } from "@bitwarden/common/importers/importer";
import { Utils } from "@bitwarden/common/misc/utils";
import { ImportService } from "@bitwarden/common/services/import.service";

describe("ImportService", () => {
  let importService: ImportService;
  let cipherService: SubstituteOf<CipherService>;
  let folderService: SubstituteOf<FolderService>;
  let apiService: SubstituteOf<ApiService>;
  let i18nService: SubstituteOf<I18nService>;
  let collectionService: SubstituteOf<CollectionService>;
  let cryptoService: SubstituteOf<CryptoService>;

  beforeEach(() => {
    cipherService = Substitute.for<CipherService>();
    folderService = Substitute.for<FolderService>();
    apiService = Substitute.for<ApiService>();
    i18nService = Substitute.for<I18nService>();
    collectionService = Substitute.for<CollectionService>();
    cryptoService = Substitute.for<CryptoService>();

    importService = new ImportService(
      cipherService,
      folderService,
      apiService,
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
