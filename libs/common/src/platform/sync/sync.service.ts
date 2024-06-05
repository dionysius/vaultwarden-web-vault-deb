import {
  SyncCipherNotification,
  SyncFolderNotification,
  SyncSendNotification,
} from "../../models/response/notification.response";

/**
 * A class encapsulating sync operations and data.
 */
export abstract class SyncService {
  /**
   * A boolean indicating if a sync is currently in progress via this instance and this instance only.
   *
   * @deprecated Trusting this property is not safe as it only tells if the current instance is currently
   * doing a sync operation but does not tell if another instance of SyncService is doing a sync operation.
   */
  abstract syncInProgress: boolean;

  /**
   * Gets the date of the last sync for the currently active user.
   *
   * @returns The date of the last sync or null if there is no active user or the active user has not synced before.
   */
  abstract getLastSync(): Promise<Date>;

  /**
   * Updates a users last sync date.
   * @param date The date to be set as the users last sync date.
   * @param userId The userId of the user to update the last sync date for.
   */
  abstract setLastSync(date: Date, userId?: string): Promise<void>;

  /**
   * Optionally does a full sync operation including going to the server to gather the source
   * of truth and set that data to state.
   * @param forceSync A boolean dictating if a sync should be forced. If `true` a sync will happen
   * as long as the current user is authenticated. If `false` it will only sync if either a sync
   * has not happened before or the last sync date for the active user is before their account
   * revision date. Try to always use `false` if possible.
   *
   * @param allowThrowOnError A boolean dictating whether or not caught errors should be rethrown.
   * `true` if they can be rethrown, `false` if they should not be rethrown.
   */
  abstract fullSync(forceSync: boolean, allowThrowOnError?: boolean): Promise<boolean>;

  abstract syncUpsertFolder(
    notification: SyncFolderNotification,
    isEdit: boolean,
  ): Promise<boolean>;
  abstract syncDeleteFolder(notification: SyncFolderNotification): Promise<boolean>;
  abstract syncUpsertCipher(
    notification: SyncCipherNotification,
    isEdit: boolean,
  ): Promise<boolean>;
  abstract syncDeleteCipher(notification: SyncFolderNotification): Promise<boolean>;
  abstract syncUpsertSend(notification: SyncSendNotification, isEdit: boolean): Promise<boolean>;
  abstract syncDeleteSend(notification: SyncSendNotification): Promise<boolean>;
}
