import { SymmetricCryptoKey } from "@bitwarden/common/models/domain/symmetricCryptoKey";

export interface AbstractKeyGenerationService {
  makeEphemeralKey(numBytes?: number): Promise<SymmetricCryptoKey>;
}
