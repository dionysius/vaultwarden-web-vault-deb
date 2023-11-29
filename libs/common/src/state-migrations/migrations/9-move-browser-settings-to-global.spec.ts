import { mock } from "jest-mock-extended";

import { FakeStorageService } from "../../../spec/fake-storage.service";
import { MigrationHelper } from "../migration-helper";
import { Migrator } from "../migrator";

import { MoveBrowserSettingsToGlobal } from "./9-move-browser-settings-to-global";

type TestState = { authenticatedAccounts: string[] } & { [key: string]: unknown };

// This could become a helper available to anyone
const runMigrator = async <TMigrator extends Migrator<number, number>>(
  migrator: TMigrator,
  initalData?: Record<string, unknown>,
): Promise<Record<string, unknown>> => {
  const fakeStorageService = new FakeStorageService(initalData);
  const helper = new MigrationHelper(migrator.fromVersion, fakeStorageService, mock());
  await migrator.migrate(helper);
  return fakeStorageService.internalStore;
};

describe("MoveBrowserSettingsToGlobal", () => {
  const myMigrator = new MoveBrowserSettingsToGlobal(8, 9);

  // This could be the state for a browser client who has never touched the settings or this could
  // be a different client who doesn't make it possible to toggle these settings
  it("doesn't set any value to global if there is no equivalent settings on the account", async () => {
    const testInput: TestState = {
      authenticatedAccounts: ["user1"],
      global: {
        theme: "system", // A real global setting that should persist after migration
      },
      user1: {
        settings: {
          region: "Self-hosted",
        },
      },
    };

    const output = await runMigrator(myMigrator, testInput);

    // No additions to the global state
    expect(output["global"]).toEqual({
      theme: "system",
    });

    // No additions to user state
    expect(output["user1"]).toEqual({
      settings: {
        region: "Self-hosted",
      },
    });
  });

  // This could be a user who opened up the settings page and toggled the checkbox, since this setting infers undefined
  // as false this is essentially the default value.
  it("sets the setting from the users settings if they have toggled the setting but placed it back to it's inferred", async () => {
    const testInput: TestState = {
      authenticatedAccounts: ["user1"],
      global: {
        theme: "system", // A real global setting that should persist after migration
      },
      user1: {
        settings: {
          disableAddLoginNotification: false,
          disableChangedPasswordNotification: false,
          disableContextMenuItem: false,
          neverDomains: {
            "example.com": null,
          },
          region: "Self-hosted",
        },
      },
    };

    const output = await runMigrator(myMigrator, testInput);

    // User settings should have moved to global
    expect(output["global"]).toEqual({
      theme: "system",
      disableAddLoginNotification: false,
      disableChangedPasswordNotification: false,
      disableContextMenuItem: false,
      neverDomains: {
        "example.com": null,
      },
    });

    // Migrated settings should be deleted
    expect(output["user1"]).toEqual({
      settings: { region: "Self-hosted" },
    });
  });

  // The user has set a value and it's not the default, we should respect that choice globally
  it("should take the only users settings", async () => {
    const testInput: TestState = {
      authenticatedAccounts: ["user1"],
      global: {
        theme: "system", // A real global setting that should persist after migration
      },
      user1: {
        settings: {
          disableAddLoginNotification: true,
          disableChangedPasswordNotification: true,
          disableContextMenuItem: true,
          neverDomains: {
            "example.com": null,
          },
          region: "Self-hosted",
        },
      },
    };

    const output = await runMigrator(myMigrator, testInput);

    // The value for the single user value should be set to global
    expect(output["global"]).toEqual({
      theme: "system",
      disableAddLoginNotification: true,
      disableChangedPasswordNotification: true,
      disableContextMenuItem: true,
      neverDomains: {
        "example.com": null,
      },
    });

    expect(output["user1"]).toEqual({
      settings: { region: "Self-hosted" },
    });
  });

  // No browser client at the time of this writing should ever have multiple authenticatedAccounts
  // but in the bizzare case, we should interpret any user having the feature turned on as the value for
  // all the accounts.
  it("should take the false value if there are conflicting choices", async () => {
    const testInput: TestState = {
      authenticatedAccounts: ["user1", "user2"],
      global: {
        theme: "system", // A real global setting that should persist after migration
      },
      user1: {
        settings: {
          disableAddLoginNotification: true,
          disableChangedPasswordNotification: true,
          disableContextMenuItem: true,
          neverDomains: {
            "example.com": null,
          },
          region: "Self-hosted",
        },
      },
      user2: {
        settings: {
          disableAddLoginNotification: false,
          disableChangedPasswordNotification: false,
          disableContextMenuItem: false,
          neverDomains: {
            "example2.com": null,
          },
          region: "Self-hosted",
        },
      },
    };

    const output = await runMigrator(myMigrator, testInput);

    // The false settings should be respected over the true values
    // neverDomains should be combined into a single object
    expect(output["global"]).toEqual({
      theme: "system",
      disableAddLoginNotification: false,
      disableChangedPasswordNotification: false,
      disableContextMenuItem: false,
      neverDomains: {
        "example.com": null,
        "example2.com": null,
      },
    });

    expect(output["user1"]).toEqual({
      settings: { region: "Self-hosted" },
    });

    expect(output["user2"]).toEqual({
      settings: { region: "Self-hosted" },
    });
  });

  // Once again, no normal browser should have conflicting values at the time of this comment but:
  // if one user has toggled the setting back to on and one user has never touched the setting,
  // persist the false value into the global state.
  it("should persist the false value if one user has that in their settings", async () => {
    const testInput: TestState = {
      authenticatedAccounts: ["user1", "user2"],
      global: {
        theme: "system", // A real global setting that should persist after migration
      },
      user1: {
        settings: {
          region: "Self-hosted",
        },
      },
      user2: {
        settings: {
          disableAddLoginNotification: false,
          disableChangedPasswordNotification: false,
          disableContextMenuItem: false,
          neverDomains: {
            "example.com": null,
          },
          region: "Self-hosted",
        },
      },
    };

    const output = await runMigrator(myMigrator, testInput);

    // The false settings should be respected over the true values
    // neverDomains should be combined into a single object
    expect(output["global"]).toEqual({
      theme: "system",
      disableAddLoginNotification: false,
      disableChangedPasswordNotification: false,
      disableContextMenuItem: false,
      neverDomains: {
        "example.com": null,
      },
    });

    expect(output["user1"]).toEqual({
      settings: { region: "Self-hosted" },
    });

    expect(output["user2"]).toEqual({
      settings: { region: "Self-hosted" },
    });
  });

  // Once again, no normal browser should have conflicting values at the time of this comment but:
  // if one user has toggled the setting off and one user has never touched the setting,
  // persist the false value into the global state.
  it("should persist the false value from a user with no settings since undefined is inferred as false", async () => {
    const testInput: TestState = {
      authenticatedAccounts: ["user1", "user2"],
      global: {
        theme: "system", // A real global setting that should persist after migration
      },
      user1: {
        settings: {
          region: "Self-hosted",
        },
      },
      user2: {
        settings: {
          disableAddLoginNotification: true,
          disableChangedPasswordNotification: true,
          disableContextMenuItem: true,
          neverDomains: {
            "example.com": null,
          },
          region: "Self-hosted",
        },
      },
    };

    const output = await runMigrator(myMigrator, testInput);

    // The false settings should be respected over the true values
    // neverDomains should be combined into a single object
    expect(output["global"]).toEqual({
      theme: "system",
      disableAddLoginNotification: false,
      disableChangedPasswordNotification: false,
      disableContextMenuItem: false,
      neverDomains: {
        "example.com": null,
      },
    });

    expect(output["user1"]).toEqual({
      settings: { region: "Self-hosted" },
    });

    expect(output["user2"]).toEqual({
      settings: { region: "Self-hosted" },
    });
  });

  // This is more realistic, a browser user could have signed into the application and logged out, then signed
  // into a different account. Pre browser account switching, the state for the user _is_ kept on disk but the account
  // id of the non-current account isn't saved to the authenticatedAccounts array so we don't have a great way to
  // get the state and include it in our calculations for what the global state should be.
  it("only cares about users defined in authenticatedAccounts", async () => {
    const testInput: TestState = {
      authenticatedAccounts: ["user1"],
      global: {
        theme: "system", // A real global setting that should persist after migration
      },
      user1: {
        settings: {
          disableAddLoginNotification: true,
          disableChangedPasswordNotification: true,
          disableContextMenuItem: true,
          neverDomains: {
            "example.com": null,
          },
          region: "Self-hosted",
        },
      },
      user2: {
        settings: {
          disableAddLoginNotification: false,
          disableChangedPasswordNotification: false,
          disableContextMenuItem: false,
          neverDomains: {
            "example2.com": null,
          },
          region: "Self-hosted",
        },
      },
    };

    const output = await runMigrator(myMigrator, testInput);

    // The true settings should be respected over the false values because that whole users values
    // shouldn't be respected.
    // neverDomains should be combined into a single object
    expect(output["global"]).toEqual({
      theme: "system",
      disableAddLoginNotification: true,
      disableChangedPasswordNotification: true,
      disableContextMenuItem: true,
      neverDomains: {
        "example.com": null,
      },
    });

    expect(output["user1"]).toEqual({
      settings: { region: "Self-hosted" },
    });

    expect(output["user2"]).toEqual({
      settings: {
        disableAddLoginNotification: false,
        disableChangedPasswordNotification: false,
        disableContextMenuItem: false,
        neverDomains: {
          "example2.com": null,
        },
        region: "Self-hosted",
      },
    });
  });
});
