import { Constructor } from "type-fest";

import { BrowserStateService } from "../../services/browser-state.service";

import { SessionStorable } from "./session-storable";
import { SessionSyncer } from "./session-syncer";
import { SyncedItemMetadata } from "./sync-item-metadata";

/**
 * Mark the class as syncing state across the browser session. This decorator finds rxjs BehaviorSubject properties
 * marked with @sessionSync and syncs these values across the browser session.
 *
 * @param constructor
 * @returns A new constructor that extends the original one to add session syncing.
 */
export function browserSession<TCtor extends Constructor<any>>(constructor: TCtor) {
  return class extends constructor implements SessionStorable {
    __syncedItemMetadata: SyncedItemMetadata[];
    __sessionSyncers: SessionSyncer[];

    constructor(...args: any[]) {
      super(...args);

      // Require state service to be injected
      const stateService: BrowserStateService = [this as any]
        .concat(args)
        .find(
          (arg) =>
            typeof arg.setInSessionMemory === "function" &&
            typeof arg.getFromSessionMemory === "function"
        );
      if (!stateService) {
        throw new Error(
          `Cannot decorate ${constructor.name} with browserSession, Browser's StateService must be injected`
        );
      }

      if (this.__syncedItemMetadata == null || !(this.__syncedItemMetadata instanceof Array)) {
        return;
      }

      this.__sessionSyncers = this.__syncedItemMetadata.map((metadata) =>
        this.buildSyncer(metadata, stateService)
      );
    }

    buildSyncer(metadata: SyncedItemMetadata, stateService: BrowserStateService) {
      const syncer = new SessionSyncer((this as any)[metadata.propertyKey], stateService, metadata);
      syncer.init();
      return syncer;
    }
  };
}
