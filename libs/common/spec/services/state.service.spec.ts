import { Arg, Substitute, SubstituteOf } from "@fluffy-spoon/substitute";

import { LogService } from "@bitwarden/common/abstractions/log.service";
import { AbstractStorageService } from "@bitwarden/common/abstractions/storage.service";
import { StateFactory } from "@bitwarden/common/factories/stateFactory";
import { Account } from "@bitwarden/common/models/domain/account";
import { GlobalState } from "@bitwarden/common/models/domain/globalState";
import { State } from "@bitwarden/common/models/domain/state";
import { StorageOptions } from "@bitwarden/common/models/domain/storageOptions";
import { SymmetricCryptoKey } from "@bitwarden/common/models/domain/symmetricCryptoKey";
import { StateService } from "@bitwarden/common/services/state.service";
import { StateMigrationService } from "@bitwarden/common/services/stateMigration.service";

describe("Browser State Service backed by chrome.storage api", () => {
  let secureStorageService: SubstituteOf<AbstractStorageService>;
  let diskStorageService: SubstituteOf<AbstractStorageService>;
  let memoryStorageService: SubstituteOf<AbstractStorageService>;
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
    memoryStorageService = Substitute.for();
    logService = Substitute.for();
    stateMigrationService = Substitute.for();
    stateFactory = Substitute.for();
    useAccountCache = true;

    state = new State(new GlobalState());
    const stateGetter = (key: string) => Promise.resolve(JSON.parse(JSON.stringify(state)));
    memoryStorageService.get("state").mimicks(stateGetter);
    memoryStorageService
      .save("state", Arg.any(), Arg.any())
      .mimicks((key: string, obj: any, options: StorageOptions) => {
        return new Promise(() => {
          state = obj;
        });
      });

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

  describe("account state getters", () => {
    beforeEach(() => {
      state.accounts[userId] = createAccount(userId);
      state.activeUserId = userId;
    });

    describe("getCryptoMasterKey", () => {
      it("should return the stored SymmetricCryptoKey", async () => {
        const key = new SymmetricCryptoKey(new Uint8Array(32).buffer);
        state.accounts[userId].keys.cryptoMasterKey = key;

        const actual = await sut.getCryptoMasterKey();
        expect(actual).toBeInstanceOf(SymmetricCryptoKey);
        expect(actual).toMatchObject(key);
      });
    });
  });

  function createAccount(userId: string): Account {
    return new Account({
      profile: { userId: userId },
    });
  }
});
