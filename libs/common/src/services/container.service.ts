import { CryptoService } from "../abstractions/crypto.service";

export class ContainerService {
  constructor(private cryptoService: CryptoService) {}

  attachToGlobal(global: any) {
    if (!global.bitwardenContainerService) {
      global.bitwardenContainerService = this;
    }
  }

  getCryptoService(): CryptoService {
    return this.cryptoService;
  }
}
