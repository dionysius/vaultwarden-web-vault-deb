import { defaultIfEmpty, filter, firstValueFrom, fromEvent, map, Subject, takeUntil } from "rxjs";
import { Jsonify } from "type-fest";

import { Utils } from "../../../platform/misc/utils";
import { Decryptable } from "../../interfaces/decryptable.interface";
import { InitializerMetadata } from "../../interfaces/initializer-metadata.interface";
import { SymmetricCryptoKey } from "../../models/domain/symmetric-crypto-key";

import { EncryptServiceImplementation } from "./encrypt.service.implementation";
import { getClassInitializer } from "./get-class-initializer";

// TTL (time to live) is not strictly required but avoids tying up memory resources if inactive
const workerTTL = 3 * 60000; // 3 minutes

export class MultithreadEncryptServiceImplementation extends EncryptServiceImplementation {
  private worker: Worker;
  private timeout: any;

  private clear$ = new Subject<void>();

  /**
   * Decrypts items using a web worker if the environment supports it.
   * Will fall back to the main thread if the window object is not available.
   */
  async decryptItems<T extends InitializerMetadata>(
    items: Decryptable<T>[],
    key: SymmetricCryptoKey,
  ): Promise<T[]> {
    if (typeof window === "undefined") {
      return super.decryptItems(items, key);
    }

    if (items == null || items.length < 1) {
      return [];
    }

    const decryptedItems = await this.getDecryptedItemsFromWorker(items, key);
    const parsedItems = JSON.parse(decryptedItems);

    return this.initializeItems(parsedItems);
  }

  /**
   * Sends items to a web worker to decrypt them. This utilizes multithreading to decrypt items
   * faster without interrupting other operations (e.g. updating UI). This method returns values
   * prior to deserialization to support forwarding results to another party
   */
  async getDecryptedItemsFromWorker<T extends InitializerMetadata>(
    items: Decryptable<T>[],
    key: SymmetricCryptoKey,
  ): Promise<string> {
    this.logService.info("Starting decryption using multithreading");

    this.worker ??= new Worker(
      new URL(
        /* webpackChunkName: 'encrypt-worker' */
        "@bitwarden/common/platform/services/cryptography/encrypt.worker.ts",
        import.meta.url,
      ),
    );

    this.restartTimeout();

    const request = {
      id: Utils.newGuid(),
      items: items,
      key: key,
    };

    this.worker.postMessage(JSON.stringify(request));

    return await firstValueFrom(
      fromEvent(this.worker, "message").pipe(
        filter((response: MessageEvent) => response.data?.id === request.id),
        map((response) => response.data.items),
        takeUntil(this.clear$),
        defaultIfEmpty("[]"),
      ),
    );
  }

  protected initializeItems<T extends InitializerMetadata>(items: Jsonify<T>[]): T[] {
    return items.map((jsonItem: Jsonify<T>) => {
      const initializer = getClassInitializer<T>(jsonItem.initializerKey);
      return initializer(jsonItem);
    });
  }

  private clear() {
    this.clear$.next();
    this.worker?.terminate();
    this.worker = null;
    this.clearTimeout();
  }

  private restartTimeout() {
    this.clearTimeout();
    this.timeout = setTimeout(() => this.clear(), workerTTL);
  }

  private clearTimeout() {
    if (this.timeout != null) {
      clearTimeout(this.timeout);
    }
  }
}
