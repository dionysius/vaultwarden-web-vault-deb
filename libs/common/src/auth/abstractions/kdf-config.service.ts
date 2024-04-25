import { UserId } from "../../types/guid";
import { KdfConfig } from "../models/domain/kdf-config";

export abstract class KdfConfigService {
  setKdfConfig: (userId: UserId, KdfConfig: KdfConfig) => Promise<void>;
  getKdfConfig: () => Promise<KdfConfig>;
}
