import { BehaviorSubject, concatMap, Subscription } from "rxjs";

import { Utils } from "@bitwarden/common/misc/utils";

import { BrowserApi } from "../../browser/browserApi";
import { StateService } from "../../services/abstractions/state.service";

import { SyncedItemMetadata } from "./sync-item-metadata";

export class SessionSyncer {
  subscription: Subscription;
  id = Utils.newGuid();

  // everyone gets the same initial values
  private ignoreNextUpdate = true;

  constructor(
    private behaviorSubject: BehaviorSubject<any>,
    private stateService: StateService,
    private metaData: SyncedItemMetadata
  ) {
    if (!(behaviorSubject instanceof BehaviorSubject)) {
      throw new Error("behaviorSubject must be an instance of BehaviorSubject");
    }

    if (metaData.ctor == null && metaData.initializer == null) {
      throw new Error("ctor or initializer must be provided");
    }
  }

  init() {
    if (chrome.runtime.getManifest().manifest_version != 3) {
      return;
    }

    this.observe();
    this.listenForUpdates();
  }

  private observe() {
    // This may be a memory leak.
    // There is no good time to unsubscribe from this observable. Hopefully Manifest V3 clears memory from temporary
    // contexts. If so, this is handled by destruction of the context.
    this.subscription = this.behaviorSubject
      .pipe(
        concatMap(async (next) => {
          if (this.ignoreNextUpdate) {
            this.ignoreNextUpdate = false;
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
    const keyValuePair = await this.stateService.getFromSessionMemory(this.metaData.sessionKey);
    const value = SyncedItemMetadata.buildFromKeyValuePair(keyValuePair, this.metaData);
    this.ignoreNextUpdate = true;
    this.behaviorSubject.next(value);
  }

  private async updateSession(value: any) {
    await this.stateService.setInSessionMemory(this.metaData.sessionKey, value);
    await BrowserApi.sendMessage(this.updateMessageCommand, { id: this.id });
  }

  private get updateMessageCommand() {
    return `${this.metaData.sessionKey}_update`;
  }
}
