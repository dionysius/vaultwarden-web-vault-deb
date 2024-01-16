import { UserKey } from "../../../../common/src/platform/models/domain/symmetric-crypto-key";
export abstract class PinCryptoServiceAbstraction {
  decryptUserKeyWithPin: (pin: string) => Promise<UserKey | null>;
}
