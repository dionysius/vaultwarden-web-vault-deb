import { SymmetricCryptoKey } from "@bitwarden/common/models/domain/symmetric-crypto-key";

export interface AbstractKeyGenerationService {
  makeEphemeralKey(numBytes?: number): Promise<SymmetricCryptoKey>;
}
