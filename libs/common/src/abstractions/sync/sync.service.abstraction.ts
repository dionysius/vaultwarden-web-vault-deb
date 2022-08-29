import { Observable } from "rxjs";

import {
  SyncCipherNotification,
  SyncFolderNotification,
  SyncSendNotification,
} from "../../models/response/notificationResponse";
import { SyncEventArgs } from "../../types/syncEventArgs";

export abstract class SyncService {
  syncInProgress: boolean;

  sync$: Observable<SyncEventArgs>;

  getLastSync: () => Promise<Date>;
  setLastSync: (date: Date, userId?: string) => Promise<any>;
  fullSync: (forceSync: boolean, allowThrowOnError?: boolean) => Promise<boolean>;
  syncUpsertFolder: (notification: SyncFolderNotification, isEdit: boolean) => Promise<boolean>;
  syncDeleteFolder: (notification: SyncFolderNotification) => Promise<boolean>;
  syncUpsertCipher: (notification: SyncCipherNotification, isEdit: boolean) => Promise<boolean>;
  syncDeleteCipher: (notification: SyncFolderNotification) => Promise<boolean>;
  syncUpsertSend: (notification: SyncSendNotification, isEdit: boolean) => Promise<boolean>;
  syncDeleteSend: (notification: SyncSendNotification) => Promise<boolean>;
}
