export abstract class BiometricsServiceAbstraction {
  abstract osSupportsBiometric(): Promise<boolean>;
  abstract canAuthBiometric({
    service,
    key,
    userId,
  }: {
    service: string;
    key: string;
    userId: string;
  }): Promise<boolean>;
  abstract authenticateBiometric(): Promise<boolean>;
  abstract getBiometricKey(service: string, key: string): Promise<string | null>;
  abstract setBiometricKey(service: string, key: string, value: string): Promise<void>;
  abstract setEncryptionKeyHalf({
    service,
    key,
    value,
  }: {
    service: string;
    key: string;
    value: string;
  }): void;
  abstract deleteBiometricKey(service: string, key: string): Promise<void>;
}

export interface OsBiometricService {
  osSupportsBiometric(): Promise<boolean>;
  authenticateBiometric(): Promise<boolean>;
  getBiometricKey(
    service: string,
    key: string,
    clientKeyHalfB64: string | undefined,
  ): Promise<string | null>;
  setBiometricKey(
    service: string,
    key: string,
    value: string,
    clientKeyHalfB64: string | undefined,
  ): Promise<void>;
  deleteBiometricKey(service: string, key: string): Promise<void>;
}
