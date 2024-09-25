import { CipherId } from "../../types/guid";

/**
 * The ViewPasswordHistoryService is responsible for displaying the password history for a cipher.
 */
export abstract class ViewPasswordHistoryService {
  abstract viewPasswordHistory(cipherId?: CipherId): Promise<void>;
}
