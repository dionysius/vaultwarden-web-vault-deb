/**
 * Service responsible for generating random passwords and usernames.
 */
export abstract class CipherFormGenerationService {
  /**
   * Generates a random password. Called when the user clicks the "Generate Password" button in the UI.
   */
  abstract generatePassword(): Promise<string | null>;

  /**
   * Generates a random username. Called when the user clicks the "Generate Username" button in the UI.
   */
  abstract generateUsername(): Promise<string | null>;

  /**
   * Generates an initial password for a new cipher. This should not involve any user interaction as it will
   * be used to pre-fill the password field in the UI for new Login ciphers.
   */
  abstract generateInitialPassword(): Promise<string | null>;
}
