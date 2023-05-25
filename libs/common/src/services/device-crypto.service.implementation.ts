import { AppIdService } from "../abstractions/appId.service";
import { CryptoService } from "../abstractions/crypto.service";
import { CryptoFunctionService } from "../abstractions/cryptoFunction.service";
import { DeviceCryptoServiceAbstraction } from "../abstractions/device-crypto.service.abstraction";
import { DevicesApiServiceAbstraction } from "../abstractions/devices/devices-api.service.abstraction";
import { DeviceResponse } from "../abstractions/devices/responses/device.response";
import { EncryptService } from "../abstractions/encrypt.service";
import { StateService } from "../abstractions/state.service";
import { DeviceKey, SymmetricCryptoKey } from "../models/domain/symmetric-crypto-key";
import { CsprngArray } from "../types/csprng";

export class DeviceCryptoService implements DeviceCryptoServiceAbstraction {
  constructor(
    protected cryptoFunctionService: CryptoFunctionService,
    protected cryptoService: CryptoService,
    protected encryptService: EncryptService,
    protected stateService: StateService,
    protected appIdService: AppIdService,
    protected devicesApiService: DevicesApiServiceAbstraction
  ) {}

  async trustDevice(): Promise<DeviceResponse> {
    // Attempt to get user symmetric key
    const userSymKey: SymmetricCryptoKey = await this.cryptoService.getEncKey();

    // If user symmetric key is not found, throw error
    if (!userSymKey) {
      throw new Error("User symmetric key not found");
    }

    // Generate deviceKey
    const deviceKey = await this.makeDeviceKey();

    // Generate asymmetric RSA key pair: devicePrivateKey, devicePublicKey
    const [devicePublicKey, devicePrivateKey] = await this.cryptoFunctionService.rsaGenerateKeyPair(
      2048
    );

    const [
      devicePublicKeyEncryptedUserSymKey,
      userSymKeyEncryptedDevicePublicKey,
      deviceKeyEncryptedDevicePrivateKey,
    ] = await Promise.all([
      // Encrypt user symmetric key with the DevicePublicKey
      this.cryptoService.rsaEncrypt(userSymKey.encKey, devicePublicKey),

      // Encrypt devicePublicKey with user symmetric key
      this.encryptService.encrypt(devicePublicKey, userSymKey),

      // Encrypt devicePrivateKey with deviceKey
      this.encryptService.encrypt(devicePrivateKey, deviceKey),
    ]);

    // Send encrypted keys to server
    const deviceIdentifier = await this.appIdService.getAppId();
    return this.devicesApiService.updateTrustedDeviceKeys(
      deviceIdentifier,
      devicePublicKeyEncryptedUserSymKey.encryptedString,
      userSymKeyEncryptedDevicePublicKey.encryptedString,
      deviceKeyEncryptedDevicePrivateKey.encryptedString
    );
  }

  async getDeviceKey(): Promise<DeviceKey> {
    // Check if device key is already stored
    const existingDeviceKey = await this.stateService.getDeviceKey();

    if (existingDeviceKey != null) {
      return existingDeviceKey;
    } else {
      return this.makeDeviceKey();
    }
  }

  private async makeDeviceKey(): Promise<DeviceKey> {
    // Create 512-bit device key
    const randomBytes: CsprngArray = await this.cryptoFunctionService.randomBytes(64);
    const deviceKey = new SymmetricCryptoKey(randomBytes) as DeviceKey;

    // Save device key in secure storage
    await this.stateService.setDeviceKey(deviceKey);

    return deviceKey;
  }
}
