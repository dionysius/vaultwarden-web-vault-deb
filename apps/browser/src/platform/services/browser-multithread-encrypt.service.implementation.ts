import { CryptoFunctionService } from "@bitwarden/common/platform/abstractions/crypto-function.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { Decryptable } from "@bitwarden/common/platform/interfaces/decryptable.interface";
import { InitializerMetadata } from "@bitwarden/common/platform/interfaces/initializer-metadata.interface";
import { Utils } from "@bitwarden/common/platform/misc/utils";
import { SymmetricCryptoKey } from "@bitwarden/common/platform/models/domain/symmetric-crypto-key";
import { MultithreadEncryptServiceImplementation } from "@bitwarden/common/platform/services/cryptography/multithread-encrypt.service.implementation";

import { BrowserApi } from "../browser/browser-api";
import { OffscreenDocumentService } from "../offscreen-document/abstractions/offscreen-document";

export class BrowserMultithreadEncryptServiceImplementation extends MultithreadEncryptServiceImplementation {
  constructor(
    cryptoFunctionService: CryptoFunctionService,
    logService: LogService,
    logMacFailures: boolean,
    private offscreenDocumentService: OffscreenDocumentService,
  ) {
    super(cryptoFunctionService, logService, logMacFailures);
  }

  /**
   * Handles decryption of items, will use the offscreen document if supported.
   *
   * @param items - The items to decrypt.
   * @param key - The key to use for decryption.
   */
  async decryptItems<T extends InitializerMetadata>(
    items: Decryptable<T>[],
    key: SymmetricCryptoKey,
  ): Promise<T[]> {
    if (!this.isOffscreenDocumentSupported()) {
      return await super.decryptItems(items, key);
    }

    return await this.decryptItemsInOffscreenDocument(items, key);
  }

  /**
   * Decrypts items using the offscreen document api.
   *
   * @param items - The items to decrypt.
   * @param key - The key to use for decryption.
   */
  private async decryptItemsInOffscreenDocument<T extends InitializerMetadata>(
    items: Decryptable<T>[],
    key: SymmetricCryptoKey,
  ): Promise<T[]> {
    if (items == null || items.length < 1) {
      return [];
    }

    const request = {
      id: Utils.newGuid(),
      items: items,
      key: key,
    };

    const response = await this.offscreenDocumentService.withDocument(
      [chrome.offscreen.Reason.WORKERS],
      "Use web worker to decrypt items.",
      async () => {
        return (await BrowserApi.sendMessageWithResponse("offscreenDecryptItems", {
          decryptRequest: JSON.stringify(request),
        })) as string;
      },
    );

    if (!response) {
      return [];
    }

    const responseItems = JSON.parse(response);
    if (responseItems?.length < 1) {
      return [];
    }

    return this.initializeItems(responseItems);
  }

  /**
   * Checks if the offscreen document api is supported.
   */
  private isOffscreenDocumentSupported() {
    return (
      BrowserApi.isManifestVersion(3) &&
      typeof chrome !== "undefined" &&
      typeof chrome.offscreen !== "undefined"
    );
  }
}
