import { mock, MockProxy } from "jest-mock-extended";
import { firstValueFrom } from "rxjs";

import { TokenService } from "@bitwarden/common/auth/abstractions/token.service";
import { EnvironmentService } from "@bitwarden/common/platform/abstractions/environment.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import {
  AbstractMemoryStorageService,
  AbstractStorageService,
} from "@bitwarden/common/platform/abstractions/storage.service";
import { StateFactory } from "@bitwarden/common/platform/factories/state-factory";
import { GlobalState } from "@bitwarden/common/platform/models/domain/global-state";
import { State } from "@bitwarden/common/platform/models/domain/state";
import { MigrationRunner } from "@bitwarden/common/platform/services/migration-runner";
import { mockAccountServiceWith } from "@bitwarden/common/spec";
import { UserId } from "@bitwarden/common/types/guid";

import { Account } from "../../models/account";

import { DefaultBrowserStateService } from "./default-browser-state.service";

// disable session syncing to just test class
jest.mock("../decorators/session-sync-observable/");

describe("Browser State Service", () => {
  let secureStorageService: MockProxy<AbstractStorageService>;
  let diskStorageService: MockProxy<AbstractStorageService>;
  let logService: MockProxy<LogService>;
  let stateFactory: MockProxy<StateFactory<GlobalState, Account>>;
  let useAccountCache: boolean;
  let environmentService: MockProxy<EnvironmentService>;
  let tokenService: MockProxy<TokenService>;
  let migrationRunner: MockProxy<MigrationRunner>;

  let state: State<GlobalState, Account>;
  const userId = "userId" as UserId;
  const accountService = mockAccountServiceWith(userId);

  let sut: DefaultBrowserStateService;

  beforeEach(() => {
    secureStorageService = mock();
    diskStorageService = mock();
    logService = mock();
    stateFactory = mock();
    environmentService = mock();
    tokenService = mock();
    migrationRunner = mock();
    // turn off account cache for tests
    useAccountCache = false;

    state = new State(new GlobalState());
    state.accounts[userId] = new Account({
      profile: { userId: userId },
    });
    state.activeUserId = userId;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("state methods", () => {
    let memoryStorageService: MockProxy<AbstractMemoryStorageService>;

    beforeEach(() => {
      memoryStorageService = mock();
      const stateGetter = (key: string) => Promise.resolve(state);
      memoryStorageService.get.mockImplementation(stateGetter);

      sut = new DefaultBrowserStateService(
        diskStorageService,
        secureStorageService,
        memoryStorageService,
        logService,
        stateFactory,
        accountService,
        environmentService,
        tokenService,
        migrationRunner,
        useAccountCache,
      );
    });

    describe("add Account", () => {
      it("should add account", async () => {
        const newUserId = "newUserId" as UserId;
        const newAcct = new Account({
          profile: { userId: newUserId },
        });

        await sut.addAccount(newAcct);

        const accts = await firstValueFrom(sut.accounts$);
        expect(accts[newUserId]).toBeDefined();
      });
    });
  });
});
