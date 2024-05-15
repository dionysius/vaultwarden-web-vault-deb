import { Subscription, concatMap, filter } from "rxjs";

import { MessageListener, isExternalMessage } from "@bitwarden/common/platform/messaging";
import { SyncService } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";

import { DO_FULL_SYNC } from "./foreground-sync.service";

export class SyncServiceListener {
  constructor(
    private readonly syncService: SyncService,
    private readonly messageListener: MessageListener,
  ) {}

  startListening(): Subscription {
    return this.messageListener
      .messages$(DO_FULL_SYNC)
      .pipe(
        filter((message) => isExternalMessage(message)),
        concatMap(async ({ forceSync, allowThrowOnError }) => {
          await this.syncService.fullSync(forceSync, allowThrowOnError);
        }),
      )
      .subscribe();
  }
}
