import { CryptoFunctionService } from "@bitwarden/common/abstractions/cryptoFunction.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { Utils } from "@bitwarden/common/misc/utils";
import { EncString } from "@bitwarden/common/models/domain/encString";
import { EncryptedObject } from "@bitwarden/common/models/domain/encryptedObject";
import { SymmetricCryptoKey } from "@bitwarden/common/models/domain/symmetricCryptoKey";

import { AbstractEncryptService } from "../abstractions/abstractEncrypt.service";

export class EncryptService implements AbstractEncryptService {
  constructor(
    private cryptoFunctionService: CryptoFunctionService,
    private logService: LogService,
    private logMacFailures: boolean
  ) {}

  async encrypt(plainValue: string | ArrayBuffer, key: SymmetricCryptoKey): Promise<EncString> {
    if (key == null) {
      throw new Error("no encryption key provided.");
    }

    if (plainValue == null) {
      return Promise.resolve(null);
    }

    let plainBuf: ArrayBuffer;
    if (typeof plainValue === "string") {
      plainBuf = Utils.fromUtf8ToArray(plainValue).buffer;
    } else {
      plainBuf = plainValue;
    }

    const encObj = await this.aesEncrypt(plainBuf, key);
    const iv = Utils.fromBufferToB64(encObj.iv);
    const data = Utils.fromBufferToB64(encObj.data);
    const mac = encObj.mac != null ? Utils.fromBufferToB64(encObj.mac) : null;
    return new EncString(encObj.key.encType, data, iv, mac);
  }

  async decryptToUtf8(encString: EncString, key: SymmetricCryptoKey): Promise<string> {
    if (key?.macKey != null && encString?.mac == null) {
      this.logService.error("mac required.");
      return null;
    }

    if (key.encType !== encString.encryptionType) {
      this.logService.error("encType unavailable.");
      return null;
    }

    const fastParams = this.cryptoFunctionService.aesDecryptFastParameters(
      encString.data,
      encString.iv,
      encString.mac,
      key
    );
    if (fastParams.macKey != null && fastParams.mac != null) {
      const computedMac = await this.cryptoFunctionService.hmacFast(
        fastParams.macData,
        fastParams.macKey,
        "sha256"
      );
      const macsEqual = await this.cryptoFunctionService.compareFast(fastParams.mac, computedMac);
      if (!macsEqual) {
        this.logMacFailed("mac failed.");
        return null;
      }
    }

    return this.cryptoFunctionService.aesDecryptFast(fastParams);
  }

  private async aesEncrypt(data: ArrayBuffer, key: SymmetricCryptoKey): Promise<EncryptedObject> {
    const obj = new EncryptedObject();
    obj.key = key;
    obj.iv = await this.cryptoFunctionService.randomBytes(16);
    obj.data = await this.cryptoFunctionService.aesEncrypt(data, obj.iv, obj.key.encKey);

    if (obj.key.macKey != null) {
      const macData = new Uint8Array(obj.iv.byteLength + obj.data.byteLength);
      macData.set(new Uint8Array(obj.iv), 0);
      macData.set(new Uint8Array(obj.data), obj.iv.byteLength);
      obj.mac = await this.cryptoFunctionService.hmac(macData.buffer, obj.key.macKey, "sha256");
    }

    return obj;
  }

  private logMacFailed(msg: string) {
    if (this.logMacFailures) {
      this.logService.error(msg);
    }
  }
}
