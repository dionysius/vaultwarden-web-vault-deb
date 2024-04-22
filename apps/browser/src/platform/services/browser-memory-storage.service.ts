import { AbstractMemoryStorageService } from "@bitwarden/common/platform/abstractions/storage.service";

import AbstractChromeStorageService from "./abstractions/abstract-chrome-storage-api.service";

export default class BrowserMemoryStorageService
  extends AbstractChromeStorageService
  implements AbstractMemoryStorageService
{
  constructor() {
    super(chrome.storage.session);
  }
  type = "MemoryStorageService" as const;
  getBypassCache<T>(key: string): Promise<T> {
    return this.get(key);
  }
}
