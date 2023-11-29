import { CryptoFunctionService } from "@bitwarden/common/platform/abstractions/crypto-function.service";
import { SymmetricCryptoKey } from "@bitwarden/common/platform/models/domain/symmetric-crypto-key";

import { AbstractKeyGenerationService } from "./abstractions/abstract-key-generation.service";

export class KeyGenerationService implements AbstractKeyGenerationService {
  constructor(private cryptoFunctionService: CryptoFunctionService) {}

  async makeEphemeralKey(numBytes = 16): Promise<SymmetricCryptoKey> {
    const keyMaterial = await this.cryptoFunctionService.randomBytes(numBytes);
    const key = await this.cryptoFunctionService.hkdf(
      keyMaterial,
      "bitwarden-ephemeral",
      "ephemeral",
      64,
      "sha256",
    );
    return new SymmetricCryptoKey(key);
  }
}
