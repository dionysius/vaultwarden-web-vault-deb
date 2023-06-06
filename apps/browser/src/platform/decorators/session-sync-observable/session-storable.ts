import { SessionSyncer } from "./session-syncer";
import { SyncedItemMetadata } from "./sync-item-metadata";

export interface SessionStorable {
  __syncedItemMetadata: SyncedItemMetadata[];
  __sessionSyncers: SessionSyncer[];
}
