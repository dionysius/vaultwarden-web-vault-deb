import { BiometricsService } from "@bitwarden/key-management";

export class WebBiometricsService extends BiometricsService {
  async supportsBiometric(): Promise<boolean> {
    return false;
  }

  async isBiometricUnlockAvailable(): Promise<boolean> {
    return false;
  }

  async authenticateBiometric(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  async biometricsNeedsSetup(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  async biometricsSupportsAutoSetup(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  async biometricsSetup(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
