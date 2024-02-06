import { Observable } from "rxjs";

import {
  SyncCipherNotification,
  SyncFolderNotification,
  SyncSendNotification,
} from "../../../models/response/notification.response";
import { UserId } from "../../../types/guid";

export abstract class SyncService {
  syncInProgress: boolean;
  lastSync$: Observable<Date | null>;

  getLastSync: () => Promise<Date>;
  setLastSync: (date: Date, userId?: UserId) => Promise<any>;
  fullSync: (forceSync: boolean, allowThrowOnError?: boolean) => Promise<boolean>;
  syncUpsertFolder: (notification: SyncFolderNotification, isEdit: boolean) => Promise<boolean>;
  syncDeleteFolder: (notification: SyncFolderNotification) => Promise<boolean>;
  syncUpsertCipher: (notification: SyncCipherNotification, isEdit: boolean) => Promise<boolean>;
  syncDeleteCipher: (notification: SyncFolderNotification) => Promise<boolean>;
  syncUpsertSend: (notification: SyncSendNotification, isEdit: boolean) => Promise<boolean>;
  syncDeleteSend: (notification: SyncSendNotification) => Promise<boolean>;
}
