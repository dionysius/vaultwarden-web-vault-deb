// eslint-disable-next-line no-restricted-imports
import { Substitute, SubstituteOf } from "@fluffy-spoon/substitute";
import { MockProxy, any, mock } from "jest-mock-extended";

import { StateVersion } from "../../enums";
import { AbstractStorageService } from "../abstractions/storage.service";
import { StateFactory } from "../factories/state-factory";
import { Account } from "../models/domain/account";
import { GlobalState } from "../models/domain/global-state";

import { StateMigrationService } from "./state-migration.service";

const userId = "USER_ID";

// Note: each test calls the private migration method for that migration,
// so that we don't accidentally run all following migrations as well

describe("State Migration Service", () => {
  let storageService: MockProxy<AbstractStorageService>;
  let secureStorageService: SubstituteOf<AbstractStorageService>;
  let stateFactory: SubstituteOf<StateFactory>;

  let stateMigrationService: StateMigrationService;

  beforeEach(() => {
    storageService = mock();
    secureStorageService = Substitute.for<AbstractStorageService>();
    stateFactory = Substitute.for<StateFactory>();

    stateMigrationService = new StateMigrationService(
      storageService,
      secureStorageService,
      stateFactory
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("StateVersion 3 to 4 migration", () => {
    beforeEach(() => {
      const globalVersion3: Partial<GlobalState> = {
        stateVersion: StateVersion.Three,
      };

      storageService.get.calledWith("global", any()).mockResolvedValue(globalVersion3);
      storageService.get.calledWith("authenticatedAccounts", any()).mockResolvedValue([userId]);
    });

    it("clears everBeenUnlocked", async () => {
      const accountVersion3: Account = {
        profile: {
          apiKeyClientId: null,
          convertAccountToKeyConnector: null,
          email: "EMAIL",
          emailVerified: true,
          everBeenUnlocked: true,
          hasPremiumPersonally: false,
          kdfIterations: 100000,
          kdfType: 0,
          keyHash: "KEY_HASH",
          lastSync: "LAST_SYNC",
          userId: userId,
          usesKeyConnector: false,
          forcePasswordResetReason: null,
        },
      };

      const expectedAccountVersion4: Account = {
        profile: {
          ...accountVersion3.profile,
        },
      };
      delete expectedAccountVersion4.profile.everBeenUnlocked;

      storageService.get.calledWith(userId, any()).mockResolvedValue(accountVersion3);

      await (stateMigrationService as any).migrateStateFrom3To4();

      expect(storageService.save).toHaveBeenCalledTimes(2);
      expect(storageService.save).toHaveBeenCalledWith(userId, expectedAccountVersion4, any());
    });

    it("updates StateVersion number", async () => {
      await (stateMigrationService as any).migrateStateFrom3To4();

      expect(storageService.save).toHaveBeenCalledWith(
        "global",
        { stateVersion: StateVersion.Four },
        any()
      );
      expect(storageService.save).toHaveBeenCalledTimes(1);
    });
  });

  describe("StateVersion 4 to 5 migration", () => {
    it("migrates organization keys to new format", async () => {
      const accountVersion4 = new Account({
        keys: {
          organizationKeys: {
            encrypted: {
              orgOneId: "orgOneEncKey",
              orgTwoId: "orgTwoEncKey",
              orgThreeId: "orgThreeEncKey",
            },
          },
        },
      } as any);

      const expectedAccount = new Account({
        keys: {
          organizationKeys: {
            encrypted: {
              orgOneId: {
                type: "organization",
                key: "orgOneEncKey",
              },
              orgTwoId: {
                type: "organization",
                key: "orgTwoEncKey",
              },
              orgThreeId: {
                type: "organization",
                key: "orgThreeEncKey",
              },
            },
          } as any,
        } as any,
      });

      const migratedAccount = await (stateMigrationService as any).migrateAccountFrom4To5(
        accountVersion4
      );

      expect(migratedAccount).toEqual(expectedAccount);
    });
  });

  describe("StateVersion 5 to 6 migration", () => {
    it("deletes account.keys.legacyEtmKey value", async () => {
      const accountVersion5 = new Account({
        keys: {
          legacyEtmKey: "legacy key",
        },
      } as any);

      const migratedAccount = await (stateMigrationService as any).migrateAccountFrom5To6(
        accountVersion5
      );

      expect(migratedAccount.keys.legacyEtmKey).toBeUndefined();
    });
  });

  describe("StateVersion 6 to 7 migration", () => {
    it("should delete global.noAutoPromptBiometrics value", async () => {
      storageService.get
        .calledWith("global", any())
        .mockResolvedValue({ stateVersion: StateVersion.Six, noAutoPromptBiometrics: true });
      storageService.get.calledWith("authenticatedAccounts", any()).mockResolvedValue([]);

      await stateMigrationService.migrate();

      expect(storageService.save).toHaveBeenCalledWith(
        "global",
        {
          stateVersion: StateVersion.Seven,
        },
        any()
      );
    });

    it("should call migrateStateFrom6To7 on each account", async () => {
      const accountVersion6 = new Account({
        otherStuff: "other stuff",
      } as any);

      storageService.get
        .calledWith("global", any())
        .mockResolvedValue({ stateVersion: StateVersion.Six, noAutoPromptBiometrics: true });
      storageService.get.calledWith("authenticatedAccounts", any()).mockResolvedValue([userId]);
      storageService.get.calledWith(userId, any()).mockResolvedValue(accountVersion6);

      const migrateSpy = jest.fn();
      (stateMigrationService as any).migrateAccountFrom6To7 = migrateSpy;

      await stateMigrationService.migrate();

      expect(migrateSpy).toHaveBeenCalledWith(true, accountVersion6);
    });

    it("should update account.settings.disableAutoBiometricsPrompt value if global is no prompt", async () => {
      const result = await (stateMigrationService as any).migrateAccountFrom6To7(true, {
        otherStuff: "other stuff",
      });

      expect(result).toEqual({
        otherStuff: "other stuff",
        settings: {
          disableAutoBiometricsPrompt: true,
        },
      });
    });

    it("should not update account.settings.disableAutoBiometricsPrompt value if global auto prompt is enabled", async () => {
      const result = await (stateMigrationService as any).migrateAccountFrom6To7(false, {
        otherStuff: "other stuff",
      });

      expect(result).toEqual({
        otherStuff: "other stuff",
      });
    });
  });
});
