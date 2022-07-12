import { Arg, Substitute, SubstituteOf } from "@fluffy-spoon/substitute";
import { BehaviorSubject, firstValueFrom } from "rxjs";

import { BroadcasterService } from "@bitwarden/common/abstractions/broadcaster.service";
import { CipherService } from "@bitwarden/common/abstractions/cipher.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { FolderData } from "@bitwarden/common/models/data/folderData";
import { EncString } from "@bitwarden/common/models/domain/encString";
import { FolderView } from "@bitwarden/common/models/view/folderView";
import { ContainerService } from "@bitwarden/common/services/container.service";
import { FolderService } from "@bitwarden/common/services/folder/folder.service";
import { StateService } from "@bitwarden/common/services/state.service";

describe("Folder Service", () => {
  let folderService: FolderService;

  let cryptoService: SubstituteOf<CryptoService>;
  let i18nService: SubstituteOf<I18nService>;
  let cipherService: SubstituteOf<CipherService>;
  let stateService: SubstituteOf<StateService>;
  let broadcasterService: SubstituteOf<BroadcasterService>;
  let activeAccount: BehaviorSubject<string>;

  beforeEach(() => {
    cryptoService = Substitute.for();
    i18nService = Substitute.for();
    cipherService = Substitute.for();
    stateService = Substitute.for();
    broadcasterService = Substitute.for();
    activeAccount = new BehaviorSubject("123");

    stateService.getEncryptedFolders().resolves({
      "1": folderData("1", "test"),
    });
    stateService.activeAccount.returns(activeAccount);
    (window as any).bitwardenContainerService = new ContainerService(cryptoService);

    folderService = new FolderService(
      cryptoService,
      i18nService,
      cipherService,
      stateService,
      broadcasterService
    );
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
