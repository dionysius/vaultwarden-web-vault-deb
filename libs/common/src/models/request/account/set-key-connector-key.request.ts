import { KdfType } from "../../../enums/kdfType";
import { KdfConfig } from "../../domain/kdf-config";
import { KeysRequest } from "../keys.request";

export class SetKeyConnectorKeyRequest {
  key: string;
  keys: KeysRequest;
  kdf: KdfType;
  kdfIterations: number;
  kdfMemory?: number;
  kdfParallelism?: number;
  orgIdentifier: string;

  constructor(
    key: string,
    kdf: KdfType,
    kdfConfig: KdfConfig,
    orgIdentifier: string,
    keys: KeysRequest
  ) {
    this.key = key;
    this.kdf = kdf;
    this.kdfIterations = kdfConfig.iterations;
    this.kdfMemory = kdfConfig.memory;
    this.kdfParallelism = kdfConfig.parallelism;
    this.orgIdentifier = orgIdentifier;
    this.keys = keys;
  }
}
