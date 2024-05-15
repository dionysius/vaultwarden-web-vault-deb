import { firstValueFrom, timeout } from "rxjs";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { AuthService } from "@bitwarden/common/auth/abstractions/auth.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";
import {
  CommandDefinition,
  MessageListener,
  MessageSender,
} from "@bitwarden/common/platform/messaging";
import { CoreSyncService } from "@bitwarden/common/platform/sync/internal";
import { SendApiService } from "@bitwarden/common/tools/send/services/send-api.service.abstraction";
import { InternalSendService } from "@bitwarden/common/tools/send/services/send.service.abstraction";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { CollectionService } from "@bitwarden/common/vault/abstractions/collection.service";
import { FolderApiServiceAbstraction } from "@bitwarden/common/vault/abstractions/folder/folder-api.service.abstraction";
import { InternalFolderService } from "@bitwarden/common/vault/abstractions/folder/folder.service.abstraction";

const SYNC_COMPLETED = new CommandDefinition<{ successfully: boolean }>("syncCompleted");
export const DO_FULL_SYNC = new CommandDefinition<{
  forceSync: boolean;
  allowThrowOnError: boolean;
}>("doFullSync");

export class ForegroundSyncService extends CoreSyncService {
  constructor(
    stateService: StateService,
    folderService: InternalFolderService,
    folderApiService: FolderApiServiceAbstraction,
    messageSender: MessageSender,
    logService: LogService,
    cipherService: CipherService,
    collectionService: CollectionService,
    apiService: ApiService,
    accountService: AccountService,
    authService: AuthService,
    sendService: InternalSendService,
    sendApiService: SendApiService,
    private readonly messageListener: MessageListener,
  ) {
    super(
      stateService,
      folderService,
      folderApiService,
      messageSender,
      logService,
      cipherService,
      collectionService,
      apiService,
      accountService,
      authService,
      sendService,
      sendApiService,
    );
  }

  async fullSync(forceSync: boolean, allowThrowOnError: boolean = false): Promise<boolean> {
    this.syncInProgress = true;
    try {
      const syncCompletedPromise = firstValueFrom(
        this.messageListener.messages$(SYNC_COMPLETED).pipe(
          timeout({
            first: 10_000,
            with: () => {
              throw new Error("Timeout while doing a fullSync call.");
            },
          }),
        ),
      );
      this.messageSender.send(DO_FULL_SYNC, { forceSync, allowThrowOnError });
      const result = await syncCompletedPromise;
      return result.successfully;
    } finally {
      this.syncInProgress = false;
    }
  }
}
