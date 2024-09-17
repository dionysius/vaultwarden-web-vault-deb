/**
 * Service to capture TOTP secret from a client application.
 */
export abstract class TotpCaptureService {
  /**
   * Captures a TOTP secret and returns it as a string. Returns null if no TOTP secret was found.
   */
  abstract captureTotpSecret(): Promise<string | null>;
}
