import { BehaviorSubject, concatMap, ReplaySubject, Subject, Subscription } from "rxjs";

import { AbstractMemoryStorageService } from "@bitwarden/common/abstractions/storage.service";
import { Utils } from "@bitwarden/common/misc/utils";

import { BrowserApi } from "../../browser/browserApi";

import { SyncedItemMetadata } from "./sync-item-metadata";

export class SessionSyncer {
  subscription: Subscription;
  id = Utils.newGuid();

  // ignore initial values
  private ignoreNUpdates = 0;

  constructor(
    private subject: Subject<any>,
    private memoryStorageService: AbstractMemoryStorageService,
    private metaData: SyncedItemMetadata
  ) {
    if (!(subject instanceof Subject)) {
      throw new Error("subject must inherit from Subject");
    }

    if (metaData.ctor == null && metaData.initializer == null) {
      throw new Error("ctor or initializer must be provided");
    }
  }

  init() {
    switch (this.subject.constructor) {
      case ReplaySubject:
        // ignore all updates currently in the buffer
        this.ignoreNUpdates = (this.subject as any)._buffer.length;
        break;
      case BehaviorSubject:
        this.ignoreNUpdates = 1;
        break;
      default:
        break;
    }

    this.observe();
    // must be synchronous
    this.memoryStorageService.has(this.metaData.sessionKey).then((hasInSessionMemory) => {
      if (hasInSessionMemory) {
        this.update();
      }
    });

    this.listenForUpdates();
  }

  private observe() {
    // This may be a memory leak.
    // There is no good time to unsubscribe from this observable. Hopefully Manifest V3 clears memory from temporary
    // contexts. If so, this is handled by destruction of the context.
    this.subscription = this.subject
      .pipe(
        concatMap(async (next) => {
          if (this.ignoreNUpdates > 0) {
            this.ignoreNUpdates -= 1;
            return;
          }
          await this.updateSession(next);
        })
      )
      .subscribe();
  }

  private listenForUpdates() {
    // This is an unawaited promise, but it will be executed asynchronously in the background.
    BrowserApi.messageListener(
      this.updateMessageCommand,
      async (message) => await this.updateFromMessage(message)
    );
  }

  async updateFromMessage(message: any) {
    if (message.command != this.updateMessageCommand || message.id === this.id) {
      return;
    }
    this.update();
  }

  async update() {
    const builder = SyncedItemMetadata.builder(this.metaData);
    const value = await this.memoryStorageService.getBypassCache(this.metaData.sessionKey, {
      deserializer: builder,
    });
    this.ignoreNUpdates = 1;
    this.subject.next(value);
  }

  private async updateSession(value: any) {
    await this.memoryStorageService.save(this.metaData.sessionKey, value);
    await BrowserApi.sendMessage(this.updateMessageCommand, { id: this.id });
  }

  private get updateMessageCommand() {
    return `${this.metaData.sessionKey}_update`;
  }
}
