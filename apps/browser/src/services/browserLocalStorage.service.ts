import AbstractChromeStorageService from "./abstractChromeStorageApi.service";

export default class BrowserLocalStorageService extends AbstractChromeStorageService {
  protected chromeStorageApi = chrome.storage.local;
}
