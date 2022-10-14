// eslint-disable-next-line no-restricted-imports
import { Arg, Substitute, SubstituteOf } from "@fluffy-spoon/substitute";
import { BehaviorSubject } from "rxjs";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { CipherService } from "@bitwarden/common/abstractions/cipher.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { CryptoFunctionService } from "@bitwarden/common/abstractions/cryptoFunction.service";
import { FolderService } from "@bitwarden/common/abstractions/folder/folder.service.abstraction";
import { CipherType } from "@bitwarden/common/enums/cipherType";
import { KdfType } from "@bitwarden/common/enums/kdfType";
import { Utils } from "@bitwarden/common/misc/utils";
import { Cipher } from "@bitwarden/common/models/domain/cipher";
import { EncString } from "@bitwarden/common/models/domain/enc-string";
import { Login } from "@bitwarden/common/models/domain/login";
import { CipherWithIdExport as CipherExport } from "@bitwarden/common/models/export/cipher-with-ids.export";
import { CipherView } from "@bitwarden/common/models/view/cipher.view";
import { LoginView } from "@bitwarden/common/models/view/login.view";
import { ExportService } from "@bitwarden/common/services/export.service";

import { BuildTestObject, GetUniqueString } from "../utils";

const UserCipherViews = [
  generateCipherView(false),
  generateCipherView(false),
  generateCipherView(true),
];

const UserCipherDomains = [
  generateCipherDomain(false),
  generateCipherDomain(false),
  generateCipherDomain(true),
];

function generateCipherView(deleted: boolean) {
  return BuildTestObject(
    {
      id: GetUniqueString("id"),
      notes: GetUniqueString("notes"),
      type: CipherType.Login,
      login: BuildTestObject<LoginView>(
        {
          username: GetUniqueString("username"),
          password: GetUniqueString("password"),
        },
        LoginView
      ),
      collectionIds: null,
      deletedDate: deleted ? new Date() : null,
    },
    CipherView
  );
}

function generateCipherDomain(deleted: boolean) {
  return BuildTestObject(
    {
      id: GetUniqueString("id"),
      notes: new EncString(GetUniqueString("notes")),
      type: CipherType.Login,
      login: BuildTestObject<Login>(
        {
          username: new EncString(GetUniqueString("username")),
          password: new EncString(GetUniqueString("password")),
        },
        Login
      ),
      collectionIds: null,
      deletedDate: deleted ? new Date() : null,
    },
    Cipher
  );
}

function expectEqualCiphers(ciphers: CipherView[] | Cipher[], jsonResult: string) {
  const actual = JSON.stringify(JSON.parse(jsonResult).items);
  const items: CipherExport[] = [];
  ciphers.forEach((c: CipherView | Cipher) => {
    const item = new CipherExport();
    item.build(c);
    items.push(item);
  });

  expect(actual).toEqual(JSON.stringify(items));
}

describe("ExportService", () => {
  let exportService: ExportService;
  let apiService: SubstituteOf<ApiService>;
  let cryptoFunctionService: SubstituteOf<CryptoFunctionService>;
  let cipherService: SubstituteOf<CipherService>;
  let folderService: SubstituteOf<FolderService>;
  let cryptoService: SubstituteOf<CryptoService>;

  beforeEach(() => {
    apiService = Substitute.for<ApiService>();
    cryptoFunctionService = Substitute.for<CryptoFunctionService>();
    cipherService = Substitute.for<CipherService>();
    folderService = Substitute.for<FolderService>();
    cryptoService = Substitute.for<CryptoService>();

    folderService.folderViews$.returns(new BehaviorSubject([]));
    folderService.folders$.returns(new BehaviorSubject([]));

    exportService = new ExportService(
      folderService,
      cipherService,
      apiService,
      cryptoService,
      cryptoFunctionService
    );
  });

  it("exports unecrypted user ciphers", async () => {
    cipherService.getAllDecrypted().resolves(UserCipherViews.slice(0, 1));

    const actual = await exportService.getExport("json");

    expectEqualCiphers(UserCipherViews.slice(0, 1), actual);
  });

  it("exports encrypted json user ciphers", async () => {
    cipherService.getAll().resolves(UserCipherDomains.slice(0, 1));

    const actual = await exportService.getExport("encrypted_json");

    expectEqualCiphers(UserCipherDomains.slice(0, 1), actual);
  });

  it("does not unecrypted export trashed user items", async () => {
    cipherService.getAllDecrypted().resolves(UserCipherViews);

    const actual = await exportService.getExport("json");

    expectEqualCiphers(UserCipherViews.slice(0, 2), actual);
  });

  it("does not encrypted export trashed user items", async () => {
    cipherService.getAll().resolves(UserCipherDomains);

    const actual = await exportService.getExport("encrypted_json");

    expectEqualCiphers(UserCipherDomains.slice(0, 2), actual);
  });

  describe("password protected export", () => {
    let exportString: string;
    let exportObject: any;
    let mac: SubstituteOf<EncString>;
    let data: SubstituteOf<EncString>;
    const password = "password";
    const salt = "salt";

    describe("export json object", () => {
      beforeEach(async () => {
        mac = Substitute.for<EncString>();
        data = Substitute.for<EncString>();

        mac.encryptedString.returns("mac");
        data.encryptedString.returns("encData");

        jest.spyOn(Utils, "fromBufferToB64").mockReturnValue(salt);
        cipherService.getAllDecrypted().resolves(UserCipherViews.slice(0, 1));

        exportString = await exportService.getPasswordProtectedExport(password);
        exportObject = JSON.parse(exportString);
      });

      it("specifies it is encrypted", () => {
        expect(exportObject.encrypted).toBe(true);
      });

      it("specifies it's password protected", () => {
        expect(exportObject.passwordProtected).toBe(true);
      });

      it("specifies salt", () => {
        expect(exportObject.salt).toEqual("salt");
      });

      it("specifies kdfIterations", () => {
        expect(exportObject.kdfIterations).toEqual(100000);
      });

      it("has kdfType", () => {
        expect(exportObject.kdfType).toEqual(KdfType.PBKDF2_SHA256);
      });

      it("has a mac property", async () => {
        cryptoService.encrypt(Arg.any(), Arg.any()).resolves(mac);
        exportString = await exportService.getPasswordProtectedExport(password);
        exportObject = JSON.parse(exportString);

        expect(exportObject.encKeyValidation_DO_NOT_EDIT).toEqual(mac.encryptedString);
      });

      it("has data property", async () => {
        cryptoService.encrypt(Arg.any(), Arg.any()).resolves(data);
        exportString = await exportService.getPasswordProtectedExport(password);
        exportObject = JSON.parse(exportString);

        expect(exportObject.data).toEqual(data.encryptedString);
      });

      it("encrypts the data property", async () => {
        const unencrypted = await exportService.getExport();
        expect(exportObject.data).not.toEqual(unencrypted);
      });
    });
  });
});
