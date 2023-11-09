import AbstractChromeStorageService from "./abstractions/abstract-chrome-storage-api.service";

export default class BrowserLocalStorageService extends AbstractChromeStorageService {
  constructor() {
    super(chrome.storage.local);
  }
}
