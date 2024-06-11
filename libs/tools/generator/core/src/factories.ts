// contains logic that constructs generator services dynamically given
// a generator id.

import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";

import { Randomizer } from "./abstractions";
import { CryptoServiceRandomizer } from "./engine/crypto-service-randomizer";

export function createRandomizer(cryptoService: CryptoService): Randomizer {
  return new CryptoServiceRandomizer(cryptoService);
}
