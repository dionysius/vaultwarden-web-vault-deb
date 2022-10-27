// eslint-disable-next-line no-restricted-imports
import { Arg, Substitute, SubstituteOf } from "@fluffy-spoon/substitute";
import { BehaviorSubject, firstValueFrom } from "rxjs";

import { CipherService } from "@bitwarden/common/abstractions/cipher.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { EncryptService } from "@bitwarden/common/abstractions/encrypt.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { FolderData } from "@bitwarden/common/models/data/folder.data";
import { EncString } from "@bitwarden/common/models/domain/enc-string";
import { FolderView } from "@bitwarden/common/models/view/folder.view";
import { ContainerService } from "@bitwarden/common/services/container.service";
import { FolderService } from "@bitwarden/common/services/folder/folder.service";
import { StateService } from "@bitwarden/common/services/state.service";

describe("Folder Service", () => {
  let folderService: FolderService;

  let cryptoService: SubstituteOf<CryptoService>;
  let encryptService: SubstituteOf<EncryptService>;
  let i18nService: SubstituteOf<I18nService>;
  let cipherService: SubstituteOf<CipherService>;
  let stateService: SubstituteOf<StateService>;
  let activeAccount: BehaviorSubject<string>;
  let activeAccountUnlocked: BehaviorSubject<boolean>;

  beforeEach(() => {
    cryptoService = Substitute.for();
    encryptService = Substitute.for();
    i18nService = Substitute.for();
    cipherService = Substitute.for();
    stateService = Substitute.for();
    activeAccount = new BehaviorSubject("123");
    activeAccountUnlocked = new BehaviorSubject(true);

    stateService.getEncryptedFolders().resolves({
      "1": folderData("1", "test"),
    });
    stateService.activeAccount$.returns(activeAccount);
    stateService.activeAccountUnlocked$.returns(activeAccountUnlocked);
    (window as any).bitwardenContainerService = new ContainerService(cryptoService, encryptService);

    folderService = new FolderService(cryptoService, i18nService, cipherService, stateService);
  });

  it("encrypt", async () => {
    const model = new FolderView();
    model.id = "2";
    model.name = "Test Folder";

    cryptoService.encrypt(Arg.any()).resolves(new EncString("ENC"));
    cryptoService.decryptToUtf8(Arg.any()).resolves("DEC");

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
          decryptedValue: [],
          encryptedString: "test",
          encryptionType: 0,
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
          decryptedValue: [],
          encryptedString: "test",
          encryptionType: 0,
        },
        revisionDate: null,
      },
      {
        id: "2",
        name: {
          decryptedValue: [],
          encryptedString: "test 2",
          encryptionType: 0,
        },
        revisionDate: null,
      },
    ]);

    expect(await firstValueFrom(folderService.folderViews$)).toEqual([
      { id: "1", name: [], revisionDate: null },
      { id: "2", name: [], revisionDate: null },
      { id: null, name: [], revisionDate: null },
    ]);
  });

  it("replace", async () => {
    await folderService.replace({ "2": folderData("2", "test 2") });

    expect(await firstValueFrom(folderService.folders$)).toEqual([
      {
        id: "2",
        name: {
          decryptedValue: [],
          encryptedString: "test 2",
          encryptionType: 0,
        },
        revisionDate: null,
      },
    ]);

    expect(await firstValueFrom(folderService.folderViews$)).toEqual([
      { id: "2", name: [], revisionDate: null },
      { id: null, name: [], revisionDate: null },
    ]);
  });

  it("delete", async () => {
    await folderService.delete("1");

    expect((await firstValueFrom(folderService.folders$)).length).toBe(0);

    expect(await firstValueFrom(folderService.folderViews$)).toEqual([
      { id: null, name: [], revisionDate: null },
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

      stateService.received(1).setEncryptedFolders(Arg.any(), Arg.any());

      expect((await firstValueFrom(folderService.folders$)).length).toBe(0);
      expect((await firstValueFrom(folderService.folderViews$)).length).toBe(0);
    });

    it("matching userId", async () => {
      stateService.getUserId().resolves("1");
      await folderService.clear("1");

      stateService.received(1).setEncryptedFolders(Arg.any(), Arg.any());

      expect((await firstValueFrom(folderService.folders$)).length).toBe(0);
      expect((await firstValueFrom(folderService.folderViews$)).length).toBe(0);
    });

    it("missmatching userId", async () => {
      await folderService.clear("12");

      stateService.received(1).setEncryptedFolders(Arg.any(), Arg.any());

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
