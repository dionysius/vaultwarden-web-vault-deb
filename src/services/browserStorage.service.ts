import {
    PlatformUtilsService,
    StorageService,
} from 'jslib/abstractions';

export default class BrowserStorageService implements StorageService {
    private chromeStorageApi: any;

    constructor() {
        this.chromeStorageApi = chrome.storage.local;
    }

    async get<T>(key: string): Promise<T> {
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

    async save(key: string, obj: any): Promise<any> {
        const keyedObj = { [key]: obj };
        return new Promise((resolve) => {
            this.chromeStorageApi.set(keyedObj, () => {
                resolve();
            });
        });
    }

    async remove(key: string): Promise<any> {
        return new Promise((resolve) => {
            this.chromeStorageApi.remove(key, () => {
                resolve();
            });
        });
    }
}
