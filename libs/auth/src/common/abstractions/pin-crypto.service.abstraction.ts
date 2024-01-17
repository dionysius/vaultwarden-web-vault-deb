import { UserKey } from "@bitwarden/common/types/key";

export abstract class PinCryptoServiceAbstraction {
  decryptUserKeyWithPin: (pin: string) => Promise<UserKey | null>;
}
