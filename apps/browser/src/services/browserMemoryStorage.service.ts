import AbstractChromeStorageService from "./abstractChromeStorageApi.service";

export default class BrowserMemoryStorageService extends AbstractChromeStorageService {
  protected chromeStorageApi = chrome.storage.session;
}
