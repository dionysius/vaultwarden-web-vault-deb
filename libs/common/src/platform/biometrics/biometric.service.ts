/**
 * The biometrics service is used to provide access to the status of and access to biometric functionality on the platforms.
 */
export abstract class BiometricsService {
  /**
   * Check if the platform supports biometric authentication.
   */
  abstract supportsBiometric(): Promise<boolean>;

  /**
   * Checks whether biometric unlock is currently available at the moment (e.g. if the laptop lid is shut, biometric unlock may not be available)
   */
  abstract isBiometricUnlockAvailable(): Promise<boolean>;

  /**
   * Performs biometric authentication
   */
  abstract authenticateBiometric(): Promise<boolean>;
}
