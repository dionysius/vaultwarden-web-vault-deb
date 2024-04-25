import { KeysRequest } from "../../../models/request/keys.request";
import { KdfType } from "../../../platform/enums";
import { KdfConfig } from "../domain/kdf-config";

export class SetKeyConnectorKeyRequest {
  key: string;
  keys: KeysRequest;
  kdf: KdfType;
  kdfIterations: number;
  kdfMemory?: number;
  kdfParallelism?: number;
  orgIdentifier: string;

  constructor(key: string, kdfConfig: KdfConfig, orgIdentifier: string, keys: KeysRequest) {
    this.key = key;
    this.kdf = kdfConfig.kdfType;
    this.kdfIterations = kdfConfig.iterations;
    if (kdfConfig.kdfType === KdfType.Argon2id) {
      this.kdfMemory = kdfConfig.memory;
      this.kdfParallelism = kdfConfig.parallelism;
    }
    this.orgIdentifier = orgIdentifier;
    this.keys = keys;
  }
}
