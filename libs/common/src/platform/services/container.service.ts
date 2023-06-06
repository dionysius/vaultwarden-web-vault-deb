import { CryptoService } from "../abstractions/crypto.service";
import { EncryptService } from "../abstractions/encrypt.service";

export class ContainerService {
  constructor(private cryptoService: CryptoService, private encryptService: EncryptService) {}

  attachToGlobal(global: any) {
    if (!global.bitwardenContainerService) {
      global.bitwardenContainerService = this;
    }
  }

  /**
   * @throws Will throw if CryptoService was not instantiated and provided to the ContainerService constructor
   */
  getCryptoService(): CryptoService {
    if (this.cryptoService == null) {
      throw new Error("ContainerService.cryptoService not initialized.");
    }
    return this.cryptoService;
  }

  /**
   * @throws Will throw if EncryptService was not instantiated and provided to the ContainerService constructor
   */
  getEncryptService(): EncryptService {
    if (this.encryptService == null) {
      throw new Error("ContainerService.encryptService not initialized.");
    }
    return this.encryptService;
  }
}
