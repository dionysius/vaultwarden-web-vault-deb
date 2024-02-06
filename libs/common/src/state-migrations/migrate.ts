// eslint-disable-next-line import/no-restricted-paths -- Needed to print log messages
import { LogService } from "../platform/abstractions/log.service";
// eslint-disable-next-line import/no-restricted-paths -- Needed to interface with storage locations
import { AbstractStorageService } from "../platform/abstractions/storage.service";

import { MigrationBuilder } from "./migration-builder";
import { MigrationHelper } from "./migration-helper";
import { EverHadUserKeyMigrator } from "./migrations/10-move-ever-had-user-key-to-state-providers";
import { OrganizationKeyMigrator } from "./migrations/11-move-org-keys-to-state-providers";
import { MoveEnvironmentStateToProviders } from "./migrations/12-move-environment-state-to-providers";
import { ProviderKeyMigrator } from "./migrations/13-move-provider-keys-to-state-providers";
import { MoveBiometricClientKeyHalfToStateProviders } from "./migrations/14-move-biometric-client-key-half-state-to-providers";
import { FolderMigrator } from "./migrations/15-move-folder-state-to-state-provider";
import { LastSyncMigrator } from "./migrations/16-move-last-sync-to-state-provider";
import { EnablePasskeysMigrator } from "./migrations/17-move-enable-passkeys-to-state-providers";
import { FixPremiumMigrator } from "./migrations/3-fix-premium";
import { RemoveEverBeenUnlockedMigrator } from "./migrations/4-remove-ever-been-unlocked";
import { AddKeyTypeToOrgKeysMigrator } from "./migrations/5-add-key-type-to-org-keys";
import { RemoveLegacyEtmKeyMigrator } from "./migrations/6-remove-legacy-etm-key";
import { MoveBiometricAutoPromptToAccount } from "./migrations/7-move-biometric-auto-prompt-to-account";
import { MoveStateVersionMigrator } from "./migrations/8-move-state-version";
import { MoveBrowserSettingsToGlobal } from "./migrations/9-move-browser-settings-to-global";
import { MinVersionMigrator } from "./migrations/min-version";

export const MIN_VERSION = 2;
export const CURRENT_VERSION = 17;
export type MinVersion = typeof MIN_VERSION;

export async function migrate(
  storageService: AbstractStorageService,
  logService: LogService,
): Promise<void> {
  const migrationHelper = new MigrationHelper(
    await currentVersion(storageService, logService),
    storageService,
    logService,
  );
  if (migrationHelper.currentVersion < 0) {
    // Cannot determine state, assuming empty so we don't repeatedly apply a migration.
    await storageService.save("stateVersion", CURRENT_VERSION);
    return;
  }
  await MigrationBuilder.create()
    .with(MinVersionMigrator)
    .with(FixPremiumMigrator, 2, 3)
    .with(RemoveEverBeenUnlockedMigrator, 3, 4)
    .with(AddKeyTypeToOrgKeysMigrator, 4, 5)
    .with(RemoveLegacyEtmKeyMigrator, 5, 6)
    .with(MoveBiometricAutoPromptToAccount, 6, 7)
    .with(MoveStateVersionMigrator, 7, 8)
    .with(MoveBrowserSettingsToGlobal, 8, 9)
    .with(EverHadUserKeyMigrator, 9, 10)
    .with(OrganizationKeyMigrator, 10, 11)
    .with(MoveEnvironmentStateToProviders, 11, 12)
    .with(ProviderKeyMigrator, 12, 13)
    .with(MoveBiometricClientKeyHalfToStateProviders, 13, 14)
    .with(FolderMigrator, 14, 15)
    .with(LastSyncMigrator, 15, 16)
    .with(EnablePasskeysMigrator, 16, CURRENT_VERSION)

    .migrate(migrationHelper);
}

export async function currentVersion(
  storageService: AbstractStorageService,
  logService: LogService,
) {
  let state = await storageService.get<number>("stateVersion");
  if (state == null) {
    // Pre v8
    state = (await storageService.get<{ stateVersion: number }>("global"))?.stateVersion;
  }
  if (state == null) {
    logService.info("No state version found, assuming empty state.");
    return -1;
  }
  logService.info(`State version: ${state}`);
  return state;
}

/**
 * Waits for migrations to have a chance to run and will resolve the promise once they are.
 *
 * @param storageService Disk storage where the `stateVersion` will or is already saved in.
 * @param logService Log service
 */
export async function waitForMigrations(
  storageService: AbstractStorageService,
  logService: LogService,
) {
  const isReady = async () => {
    const version = await currentVersion(storageService, logService);
    // The saved version is what we consider the latest
    // migrations should be complete
    return version === CURRENT_VERSION;
  };

  const wait = async (time: number) => {
    // Wait exponentially
    const nextTime = time * 2;
    if (nextTime > 8192) {
      // Don't wait longer than ~8 seconds in a single wait,
      // if the migrations still haven't happened. They aren't
      // likely to.
      return;
    }
    return new Promise<void>((resolve) => {
      setTimeout(async () => {
        if (!(await isReady())) {
          logService.info(`Waiting for migrations to finish, waiting for ${nextTime}ms`);
          await wait(nextTime);
        }
        resolve();
      }, time);
    });
  };

  if (!(await isReady())) {
    // Wait for 2ms to start with
    await wait(2);
  }
}
