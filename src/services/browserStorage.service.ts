import {
    PlatformUtilsService,
    StorageService,
} from 'jslib/abstractions';

import { SafariApp } from '../browser/safariApp';

export default class BrowserStorageService implements StorageService {
    private chromeStorageApi: any;
    private isSafari: boolean;

    constructor(platformUtilsService: PlatformUtilsService) {
        this.isSafari = platformUtilsService.isSafari();
        if (!this.isSafari) {
            this.chromeStorageApi = chrome.storage.local;
        }
    }

    async get<T>(key: string): Promise<T> {
        if (this.isSafari) {
            const obj = await SafariApp.sendMessageToApp('storage_get', key);
            return obj as T;
        } else {
            return new Promise((resolve) => {
                this.chromeStorageApi.get(key, (obj: any) => {
                    if (obj != null && obj[key] != null) {
                        resolve(obj[key] as T);
                        return;
                    }
                    resolve(null);
                });
            });
        }
    }

    async save(key: string, obj: any): Promise<any> {
        const keyedObj = { [key]: obj };
        if (this.isSafari) {
            await SafariApp.sendMessageToApp('storage_save', {
                key: key,
                obj: obj,
            });
        } else {
            return new Promise((resolve) => {
                this.chromeStorageApi.set(keyedObj, () => {
                    resolve();
                });
            });
        }
    }

    async remove(key: string): Promise<any> {
        if (this.isSafari) {
            await SafariApp.sendMessageToApp('storage_remove', key);
        } else {
            return new Promise((resolve) => {
                this.chromeStorageApi.remove(key, () => {
                    resolve();
                });
            });
        }
    }
}
