// eslint-disable-next-line no-restricted-imports
import { Arg, Substitute, SubstituteOf } from "@fluffy-spoon/substitute";

import { LogService } from "@bitwarden/common/abstractions/log.service";
import {
  MemoryStorageServiceInterface,
  AbstractStorageService,
} from "@bitwarden/common/abstractions/storage.service";
import { SendType } from "@bitwarden/common/enums/sendType";
import { StateFactory } from "@bitwarden/common/factories/stateFactory";
import { GlobalState } from "@bitwarden/common/models/domain/global-state";
import { State } from "@bitwarden/common/models/domain/state";
import { SendView } from "@bitwarden/common/models/view/send.view";
import { StateMigrationService } from "@bitwarden/common/services/stateMigration.service";

import { Account } from "../models/account";
import { BrowserComponentState } from "../models/browserComponentState";
import { BrowserGroupingsComponentState } from "../models/browserGroupingsComponentState";
import { BrowserSendComponentState } from "../models/browserSendComponentState";

import { LocalBackedSessionStorageService } from "./localBackedSessionStorage.service";
import { StateService } from "./state.service";

describe("Browser State Service", () => {
  let secureStorageService: SubstituteOf<AbstractStorageService>;
  let diskStorageService: SubstituteOf<AbstractStorageService>;
  let logService: SubstituteOf<LogService>;
  let stateMigrationService: SubstituteOf<StateMigrationService>;
  let stateFactory: SubstituteOf<StateFactory<GlobalState, Account>>;
  let useAccountCache: boolean;

  let state: State<GlobalState, Account>;
  const userId = "userId";

  let sut: StateService;

  beforeEach(() => {
    secureStorageService = Substitute.for();
    diskStorageService = Substitute.for();
    logService = Substitute.for();
    stateMigrationService = Substitute.for();
    stateFactory = Substitute.for();
    useAccountCache = true;

    state = new State(new GlobalState());
    state.accounts[userId] = new Account({
      profile: { userId: userId },
    });
    state.activeUserId = userId;
  });

  describe("direct memory storage access", () => {
    let memoryStorageService: LocalBackedSessionStorageService;

    beforeEach(() => {
      // We need `AbstractCachedStorageService` in the prototype chain to correctly test cache bypass.
      memoryStorageService = Object.create(LocalBackedSessionStorageService.prototype);

      sut = new StateService(
        diskStorageService,
        secureStorageService,
        memoryStorageService,
        logService,
        stateMigrationService,
        stateFactory,
        useAccountCache
      );
    });

    it("should bypass cache if possible", async () => {
      const spyBypass = jest
        .spyOn(memoryStorageService, "getBypassCache")
        .mockResolvedValue("value");
      const spyGet = jest.spyOn(memoryStorageService, "get");
      const result = await sut.getFromSessionMemory("key");
      expect(spyBypass).toHaveBeenCalled();
      expect(spyGet).not.toHaveBeenCalled();
      expect(result).toBe("value");
    });
  });

  describe("state methods", () => {
    let memoryStorageService: SubstituteOf<AbstractStorageService & MemoryStorageServiceInterface>;

    beforeEach(() => {
      memoryStorageService = Substitute.for();
      const stateGetter = (key: string) => Promise.resolve(JSON.parse(JSON.stringify(state)));
      memoryStorageService.get("state", Arg.any()).mimicks(stateGetter);

      sut = new StateService(
        diskStorageService,
        secureStorageService,
        memoryStorageService,
        logService,
        stateMigrationService,
        stateFactory,
        useAccountCache
      );
    });

    describe("getBrowserGroupingComponentState", () => {
      it("should return a BrowserGroupingsComponentState", async () => {
        state.accounts[userId].groupings = new BrowserGroupingsComponentState();

        const actual = await sut.getBrowserGroupingComponentState();
        expect(actual).toBeInstanceOf(BrowserGroupingsComponentState);
      });
    });

    describe("getBrowserCipherComponentState", () => {
      it("should return a BrowserComponentState", async () => {
        const componentState = new BrowserComponentState();
        componentState.scrollY = 0;
        componentState.searchText = "test";
        state.accounts[userId].ciphers = componentState;

        const actual = await sut.getBrowserCipherComponentState();
        expect(actual).toStrictEqual(componentState);
      });
    });

    describe("getBrowserSendComponentState", () => {
      it("should return a BrowserSendComponentState", async () => {
        const sendState = new BrowserSendComponentState();
        sendState.sends = [new SendView(), new SendView()];
        sendState.typeCounts = new Map<SendType, number>([
          [SendType.File, 3],
          [SendType.Text, 5],
        ]);
        state.accounts[userId].send = sendState;

        const actual = await sut.getBrowserSendComponentState();
        expect(actual).toBeInstanceOf(BrowserSendComponentState);
        expect(actual).toMatchObject(sendState);
      });
    });

    describe("getBrowserSendTypeComponentState", () => {
      it("should return a BrowserComponentState", async () => {
        const componentState = new BrowserComponentState();
        componentState.scrollY = 0;
        componentState.searchText = "test";
        state.accounts[userId].sendType = componentState;

        const actual = await sut.getBrowserSendTypeComponentState();
        expect(actual).toStrictEqual(componentState);
      });
    });
  });
});
