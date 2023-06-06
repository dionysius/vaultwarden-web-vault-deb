import AbstractChromeStorageService from "./abstractions/abstract-chrome-storage-api.service";

export default class BrowserMemoryStorageService extends AbstractChromeStorageService {
  protected chromeStorageApi = chrome.storage.session;
}
