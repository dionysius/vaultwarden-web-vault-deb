import AbstractChromeStorageService from "./abstractChromeStorageApi.service";

export default class BrowserLocalStorageService extends AbstractChromeStorageService {
  protected chromeStorageApi: any = chrome.storage.local;
}
