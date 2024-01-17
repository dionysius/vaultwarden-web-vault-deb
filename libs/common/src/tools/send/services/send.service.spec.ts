import { any, mock, MockProxy } from "jest-mock-extended";
import { BehaviorSubject, firstValueFrom } from "rxjs";

import { CryptoFunctionService } from "../../../platform/abstractions/crypto-function.service";
import { CryptoService } from "../../../platform/abstractions/crypto.service";
import { EncryptService } from "../../../platform/abstractions/encrypt.service";
import { I18nService } from "../../../platform/abstractions/i18n.service";
import { StateService } from "../../../platform/abstractions/state.service";
import { EncString } from "../../../platform/models/domain/enc-string";
import { SymmetricCryptoKey } from "../../../platform/models/domain/symmetric-crypto-key";
import { ContainerService } from "../../../platform/services/container.service";
import { UserKey } from "../../../types/key";
import { SendData } from "../models/data/send.data";
import { Send } from "../models/domain/send";
import { SendView } from "../models/view/send.view";

import { SendService } from "./send.service";

describe("SendService", () => {
  const cryptoService = mock<CryptoService>();
  const i18nService = mock<I18nService>();
  const cryptoFunctionService = mock<CryptoFunctionService>();
  const encryptService = mock<EncryptService>();

  let sendService: SendService;

  let stateService: MockProxy<StateService>;
  let activeAccount: BehaviorSubject<string>;
  let activeAccountUnlocked: BehaviorSubject<boolean>;

  beforeEach(() => {
    activeAccount = new BehaviorSubject("123");
    activeAccountUnlocked = new BehaviorSubject(true);

    stateService = mock<StateService>();
    stateService.activeAccount$ = activeAccount;
    stateService.activeAccountUnlocked$ = activeAccountUnlocked;
    (window as any).bitwardenContainerService = new ContainerService(cryptoService, encryptService);

    stateService.getEncryptedSends.calledWith(any()).mockResolvedValue({
      "1": sendData("1", "Test Send"),
    });

    stateService.getDecryptedSends
      .calledWith(any())
      .mockResolvedValue([sendView("1", "Test Send")]);

    sendService = new SendService(cryptoService, i18nService, cryptoFunctionService, stateService);
  });

  afterEach(() => {
    activeAccount.complete();
    activeAccountUnlocked.complete();
  });

  describe("get", () => {
    it("exists", async () => {
      const result = sendService.get("1");

      expect(result).toEqual(send("1", "Test Send"));
    });

    it("does not exist", async () => {
      const result = sendService.get("2");

      expect(result).toBe(undefined);
    });
  });

  it("getAll", async () => {
    const sends = await sendService.getAll();
    const send1 = sends[0];

    expect(sends).toHaveLength(1);
    expect(send1).toEqual(send("1", "Test Send"));
  });

  describe("getFromState", () => {
    it("exists", async () => {
      const result = await sendService.getFromState("1");

      expect(result).toEqual(send("1", "Test Send"));
    });
    it("does not exist", async () => {
      const result = await sendService.getFromState("2");

      expect(result).toBe(null);
    });
  });

  it("getAllDecryptedFromState", async () => {
    await sendService.getAllDecryptedFromState();

    expect(stateService.getDecryptedSends).toHaveBeenCalledTimes(1);
  });

  describe("getRotatedKeys", () => {
    let encryptedKey: EncString;
    beforeEach(() => {
      cryptoService.decryptToBytes.mockResolvedValue(new Uint8Array(32));
      encryptedKey = new EncString("Re-encrypted Send Key");
      cryptoService.encrypt.mockResolvedValue(encryptedKey);
    });

    it("returns re-encrypted user sends", async () => {
      const newUserKey = new SymmetricCryptoKey(new Uint8Array(32)) as UserKey;
      const result = await sendService.getRotatedKeys(newUserKey);

      expect(result).toMatchObject([{ id: "1", key: "Re-encrypted Send Key" }]);
    });

    it("returns null if there are no sends", async () => {
      sendService.replace(null);

      const newUserKey = new SymmetricCryptoKey(new Uint8Array(32)) as UserKey;
      const result = await sendService.getRotatedKeys(newUserKey);

      expect(result).toEqual([]);
    });

    it("throws if the new user key is null", async () => {
      await expect(sendService.getRotatedKeys(null)).rejects.toThrowError(
        "New user key is required for rotation.",
      );
    });
  });

  // InternalSendService

  it("upsert", async () => {
    await sendService.upsert(sendData("2", "Test 2"));

    expect(await firstValueFrom(sendService.sends$)).toEqual([
      send("1", "Test Send"),
      send("2", "Test 2"),
    ]);
  });

  it("replace", async () => {
    await sendService.replace({ "2": sendData("2", "test 2") });

    expect(await firstValueFrom(sendService.sends$)).toEqual([send("2", "test 2")]);
  });

  it("clear", async () => {
    await sendService.clear();

    expect(await firstValueFrom(sendService.sends$)).toEqual([]);
  });

  describe("delete", () => {
    it("exists", async () => {
      await sendService.delete("1");

      expect(stateService.getEncryptedSends).toHaveBeenCalledTimes(2);
      expect(stateService.setEncryptedSends).toHaveBeenCalledTimes(1);
    });

    it("does not exist", async () => {
      sendService.delete("1");

      expect(stateService.getEncryptedSends).toHaveBeenCalledTimes(2);
    });
  });

  // Send object helper functions

  function sendData(id: string, name: string) {
    const data = new SendData({} as any);
    data.id = id;
    data.name = name;
    data.disabled = false;
    data.accessCount = 2;
    data.accessId = "1";
    data.revisionDate = null;
    data.expirationDate = null;
    data.deletionDate = null;
    data.notes = "Notes!!";
    data.key = null;
    return data;
  }

  function sendView(id: string, name: string) {
    const data = new SendView({} as any);
    data.id = id;
    data.name = name;
    data.disabled = false;
    data.accessCount = 2;
    data.accessId = "1";
    data.revisionDate = null;
    data.expirationDate = null;
    data.deletionDate = null;
    data.notes = "Notes!!";
    data.key = null;
    return data;
  }

  function send(id: string, name: string) {
    const data = new Send({} as any);
    data.id = id;
    data.name = new EncString(name);
    data.disabled = false;
    data.accessCount = 2;
    data.accessId = "1";
    data.revisionDate = null;
    data.expirationDate = null;
    data.deletionDate = null;
    data.notes = new EncString("Notes!!");
    data.key = null;
    return data;
  }
});
