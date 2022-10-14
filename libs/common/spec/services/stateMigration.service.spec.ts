// eslint-disable-next-line no-restricted-imports
import { Arg, Substitute, SubstituteOf } from "@fluffy-spoon/substitute";

import { AbstractStorageService } from "@bitwarden/common/abstractions/storage.service";
import { StateVersion } from "@bitwarden/common/enums/stateVersion";
import { StateFactory } from "@bitwarden/common/factories/stateFactory";
import { Account } from "@bitwarden/common/models/domain/account";
import { GlobalState } from "@bitwarden/common/models/domain/global-state";
import { StateMigrationService } from "@bitwarden/common/services/stateMigration.service";

const userId = "USER_ID";

// Note: each test calls the private migration method for that migration,
// so that we don't accidentally run all following migrations as well

describe("State Migration Service", () => {
  let storageService: SubstituteOf<AbstractStorageService>;
  let secureStorageService: SubstituteOf<AbstractStorageService>;
  let stateFactory: SubstituteOf<StateFactory>;

  let stateMigrationService: StateMigrationService;

  beforeEach(() => {
    storageService = Substitute.for<AbstractStorageService>();
    secureStorageService = Substitute.for<AbstractStorageService>();
    stateFactory = Substitute.for<StateFactory>();

    stateMigrationService = new StateMigrationService(
      storageService,
      secureStorageService,
      stateFactory
    );
  });

  describe("StateVersion 3 to 4 migration", () => {
    beforeEach(() => {
      const globalVersion3: Partial<GlobalState> = {
        stateVersion: StateVersion.Three,
      };

      storageService.get("global", Arg.any()).resolves(globalVersion3);
      storageService.get("authenticatedAccounts", Arg.any()).resolves([userId]);
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
          forcePasswordReset: false,
        },
      };

      const expectedAccountVersion4: Account = {
        profile: {
          ...accountVersion3.profile,
        },
      };
      delete expectedAccountVersion4.profile.everBeenUnlocked;

      storageService.get(userId, Arg.any()).resolves(accountVersion3);

      await (stateMigrationService as any).migrateStateFrom3To4();

      storageService.received(1).save(userId, expectedAccountVersion4, Arg.any());
    });

    it("updates StateVersion number", async () => {
      await (stateMigrationService as any).migrateStateFrom3To4();

      storageService.received(1).save(
        "global",
        Arg.is((globals: GlobalState) => globals.stateVersion === StateVersion.Four),
        Arg.any()
      );
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
});
