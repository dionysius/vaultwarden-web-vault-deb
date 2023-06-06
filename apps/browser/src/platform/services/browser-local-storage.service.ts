import AbstractChromeStorageService from "./abstractions/abstract-chrome-storage-api.service";

export default class BrowserLocalStorageService extends AbstractChromeStorageService {
  protected chromeStorageApi = chrome.storage.local;
}
