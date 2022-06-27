import AbstractChromeStorageService from "./abstractChromeStorageApi.service";

export default class BrowserMemoryStorageService extends AbstractChromeStorageService {
  protected chromeStorageApi: any = (chrome.storage as any).session;
}
