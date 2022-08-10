import { EventService } from "@bitwarden/common/abstractions/event.service";
import { EventType } from "@bitwarden/common/enums/eventType";

/**
 * If you want to use this, don't.
 * If you think you should use that after the warning, don't.
 */
export default class NoOpEventService implements EventService {
  constructor() {
    if (chrome.runtime.getManifest().manifest_version !== 3) {
      throw new Error("You are not allowed to use this when not in manifest_version 3");
    }
  }

  collect(eventType: EventType, cipherId?: string, uploadImmediately?: boolean) {
    return Promise.resolve();
  }
  uploadEvents(userId?: string) {
    return Promise.resolve();
  }
  clearEvents(userId?: string) {
    return Promise.resolve();
  }
}
