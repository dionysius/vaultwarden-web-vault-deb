import { mock, MockProxy } from "jest-mock-extended";
import { BehaviorSubject, firstValueFrom } from "rxjs";

import { makeStaticByteArray } from "../../../../spec";
import { CryptoService } from "../../../platform/abstractions/crypto.service";
import { EncryptService } from "../../../platform/abstractions/encrypt.service";
import { I18nService } from "../../../platform/abstractions/i18n.service";
import { StateService } from "../../../platform/abstractions/state.service";
import { EncString } from "../../../platform/models/domain/enc-string";
import { SymmetricCryptoKey, UserKey } from "../../../platform/models/domain/symmetric-crypto-key";
import { ContainerService } from "../../../platform/services/container.service";
import { CipherService } from "../../abstractions/cipher.service";
import { FolderData } from "../../models/data/folder.data";
import { FolderView } from "../../models/view/folder.view";
import { FolderService } from "../../services/folder/folder.service";

describe("Folder Service", () => {
  let folderService: FolderService;

  let cryptoService: MockProxy<CryptoService>;
  let encryptService: MockProxy<EncryptService>;
  let i18nService: MockProxy<I18nService>;
  let cipherService: MockProxy<CipherService>;
  let stateService: MockProxy<StateService>;
  let activeAccount: BehaviorSubject<string>;
  let activeAccountUnlocked: BehaviorSubject<boolean>;

  beforeEach(() => {
    cryptoService = mock<CryptoService>();
    encryptService = mock<EncryptService>();
    i18nService = mock<I18nService>();
    cipherService = mock<CipherService>();
    stateService = mock<StateService>();
    activeAccount = new BehaviorSubject("123");
    activeAccountUnlocked = new BehaviorSubject(true);

    i18nService.collator = new Intl.Collator("en");
    stateService.getEncryptedFolders.mockResolvedValue({
      "1": folderData("1", "test"),
    });
    stateService.activeAccount$ = activeAccount;
    stateService.activeAccountUnlocked$ = activeAccountUnlocked;

    cryptoService.hasUserKey.mockResolvedValue(true);
    cryptoService.getUserKeyWithLegacySupport.mockResolvedValue(
      new SymmetricCryptoKey(makeStaticByteArray(32)) as UserKey,
    );
    encryptService.decryptToUtf8.mockResolvedValue("DEC");

    (window as any).bitwardenContainerService = new ContainerService(cryptoService, encryptService);

    folderService = new FolderService(cryptoService, i18nService, cipherService, stateService);
  });

  it("encrypt", async () => {
    const model = new FolderView();
    model.id = "2";
    model.name = "Test Folder";

    cryptoService.encrypt.mockResolvedValue(new EncString("ENC"));
    cryptoService.decryptToUtf8.mockResolvedValue("DEC");

    const result = await folderService.encrypt(model);

    expect(result).toEqual({
      id: "2",
      name: {
        encryptedString: "ENC",
        encryptionType: 0,
      },
    });
  });

  describe("get", () => {
    it("exists", async () => {
      const result = await folderService.get("1");

      expect(result).toEqual({
        id: "1",
        name: {
          encryptedString: "test",
          encryptionType: 0,
          decryptedValue: "DEC",
        },
        revisionDate: null,
      });
    });

    it("not exists", async () => {
      const result = await folderService.get("2");

      expect(result).toBe(undefined);
    });
  });

  it("upsert", async () => {
    await folderService.upsert(folderData("2", "test 2"));

    expect(await firstValueFrom(folderService.folders$)).toEqual([
      {
        id: "1",
        name: {
          encryptedString: "test",
          encryptionType: 0,
          decryptedValue: "DEC",
        },
        revisionDate: null,
      },
      {
        id: "2",
        name: {
          encryptedString: "test 2",
          encryptionType: 0,
          decryptedValue: "DEC",
        },
        revisionDate: null,
      },
    ]);

    expect(await firstValueFrom(folderService.folderViews$)).toEqual([
      { id: "1", name: "DEC", revisionDate: null },
      { id: "2", name: "DEC", revisionDate: null },
      { id: null, name: undefined, revisionDate: null },
    ]);
  });

  it("replace", async () => {
    await folderService.replace({ "2": folderData("2", "test 2") });

    expect(await firstValueFrom(folderService.folders$)).toEqual([
      {
        id: "2",
        name: {
          decryptedValue: "DEC",
          encryptedString: "test 2",
          encryptionType: 0,
        },
        revisionDate: null,
      },
    ]);

    expect(await firstValueFrom(folderService.folderViews$)).toEqual([
      { id: "2", name: "DEC", revisionDate: null },
      { id: null, name: undefined, revisionDate: null },
    ]);
  });

  it("delete", async () => {
    await folderService.delete("1");

    expect((await firstValueFrom(folderService.folders$)).length).toBe(0);

    expect(await firstValueFrom(folderService.folderViews$)).toEqual([
      { id: null, name: undefined, revisionDate: null },
    ]);
  });

  it("clearCache", async () => {
    await folderService.clearCache();

    expect((await firstValueFrom(folderService.folders$)).length).toBe(1);
    expect((await firstValueFrom(folderService.folderViews$)).length).toBe(0);
  });

  it("locking should clear", async () => {
    activeAccountUnlocked.next(false);
    // Sleep for 100ms to avoid timing issues
    await new Promise((r) => setTimeout(r, 100));

    expect((await firstValueFrom(folderService.folders$)).length).toBe(0);
    expect((await firstValueFrom(folderService.folderViews$)).length).toBe(0);
  });

  describe("clear", () => {
    it("null userId", async () => {
      await folderService.clear();

      expect(stateService.setEncryptedFolders).toBeCalledTimes(1);

      expect((await firstValueFrom(folderService.folders$)).length).toBe(0);
      expect((await firstValueFrom(folderService.folderViews$)).length).toBe(0);
    });

    it("matching userId", async () => {
      stateService.getUserId.mockResolvedValue("1");
      await folderService.clear("1");

      expect(stateService.setEncryptedFolders).toBeCalledTimes(1);

      expect((await firstValueFrom(folderService.folders$)).length).toBe(0);
      expect((await firstValueFrom(folderService.folderViews$)).length).toBe(0);
    });

    it("missmatching userId", async () => {
      await folderService.clear("12");

      expect(stateService.setEncryptedFolders).toBeCalledTimes(1);

      expect((await firstValueFrom(folderService.folders$)).length).toBe(1);
      expect((await firstValueFrom(folderService.folderViews$)).length).toBe(2);
    });
  });

  function folderData(id: string, name: string) {
    const data = new FolderData({} as any);
    data.id = id;
    data.name = name;

    return data;
  }
});
