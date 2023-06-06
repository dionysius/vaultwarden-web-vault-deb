import { SymmetricCryptoKey } from "@bitwarden/common/platform/models/domain/symmetric-crypto-key";

export interface AbstractKeyGenerationService {
  makeEphemeralKey(numBytes?: number): Promise<SymmetricCryptoKey>;
}
