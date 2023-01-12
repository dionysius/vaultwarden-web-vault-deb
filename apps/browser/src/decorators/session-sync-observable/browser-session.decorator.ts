import { Constructor } from "type-fest";

import { AbstractMemoryStorageService } from "@bitwarden/common/abstractions/storage.service";

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
      const storageService: AbstractMemoryStorageService = this.findStorageService(
        [this as any].concat(args)
      );

      if (this.__syncedItemMetadata == null || !(this.__syncedItemMetadata instanceof Array)) {
        return;
      }

      this.__sessionSyncers = this.__syncedItemMetadata.map((metadata) =>
        this.buildSyncer(metadata, storageService)
      );
    }

    buildSyncer(metadata: SyncedItemMetadata, storageSerice: AbstractMemoryStorageService) {
      const syncer = new SessionSyncer(
        (this as any)[metadata.propertyKey],
        storageSerice,
        metadata
      );
      syncer.init();
      return syncer;
    }

    findStorageService(args: any[]): AbstractMemoryStorageService {
      const storageService = args.find(this.isMemoryStorageService);

      if (storageService) {
        return storageService;
      }

      const stateService = args.find(
        (arg) =>
          arg?.memoryStorageService != null && this.isMemoryStorageService(arg.memoryStorageService)
      );
      if (stateService) {
        return stateService.memoryStorageService;
      }

      throw new Error(
        `Cannot decorate ${constructor.name} with browserSession, Browser's AbstractMemoryStorageService must be accessible through the observed classes parameters`
      );
    }

    isMemoryStorageService(arg: any): arg is AbstractMemoryStorageService {
      return arg.type != null && arg.type === AbstractMemoryStorageService.TYPE;
    }
  };
}
