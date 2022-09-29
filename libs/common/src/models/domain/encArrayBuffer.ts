import { EncryptionType } from "../../enums/encryptionType";
import { IEncrypted } from "../../interfaces/IEncrypted";
import { Utils } from "../../misc/utils";

const ENC_TYPE_LENGTH = 1;
const IV_LENGTH = 16;
const MAC_LENGTH = 32;
const MIN_DATA_LENGTH = 1;

export class EncArrayBuffer implements IEncrypted {
  readonly encryptionType: EncryptionType = null;
  readonly dataBytes: ArrayBuffer = null;
  readonly ivBytes: ArrayBuffer = null;
  readonly macBytes: ArrayBuffer = null;

  constructor(readonly buffer: ArrayBuffer) {
    const encBytes = new Uint8Array(buffer);
    const encType = encBytes[0];

    switch (encType) {
      case EncryptionType.AesCbc128_HmacSha256_B64:
      case EncryptionType.AesCbc256_HmacSha256_B64: {
        const minimumLength = ENC_TYPE_LENGTH + IV_LENGTH + MAC_LENGTH + MIN_DATA_LENGTH;
        if (encBytes.length < minimumLength) {
          this.throwDecryptionError();
        }

        this.ivBytes = encBytes.slice(ENC_TYPE_LENGTH, ENC_TYPE_LENGTH + IV_LENGTH).buffer;
        this.macBytes = encBytes.slice(
          ENC_TYPE_LENGTH + IV_LENGTH,
          ENC_TYPE_LENGTH + IV_LENGTH + MAC_LENGTH
        ).buffer;
        this.dataBytes = encBytes.slice(ENC_TYPE_LENGTH + IV_LENGTH + MAC_LENGTH).buffer;
        break;
      }
      case EncryptionType.AesCbc256_B64: {
        const minimumLength = ENC_TYPE_LENGTH + IV_LENGTH + MIN_DATA_LENGTH;
        if (encBytes.length < minimumLength) {
          this.throwDecryptionError();
        }

        this.ivBytes = encBytes.slice(ENC_TYPE_LENGTH, ENC_TYPE_LENGTH + IV_LENGTH).buffer;
        this.dataBytes = encBytes.slice(ENC_TYPE_LENGTH + IV_LENGTH).buffer;
        break;
      }
      default:
        this.throwDecryptionError();
    }

    this.encryptionType = encType;
  }

  private throwDecryptionError() {
    throw new Error(
      "Error parsing encrypted ArrayBuffer: data is corrupted or has an invalid format."
    );
  }

  static async fromResponse(response: {
    arrayBuffer: () => Promise<ArrayBuffer>;
  }): Promise<EncArrayBuffer> {
    const buffer = await response.arrayBuffer();
    if (buffer == null) {
      throw new Error("Cannot create EncArrayBuffer from Response - Response is empty");
    }
    return new EncArrayBuffer(buffer);
  }

  static fromB64(b64: string) {
    const buffer = Utils.fromB64ToArray(b64).buffer;
    return new EncArrayBuffer(buffer);
  }
}
