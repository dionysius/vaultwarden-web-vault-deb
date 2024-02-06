import { Observable } from "rxjs";
/**
 * Service for managing vault settings.
 */
export abstract class VaultSettingsService {
  /**
   * An observable monitoring the state of the enable passkeys setting.
   * The observable updates when the setting changes.
   */
  enablePasskeys$: Observable<boolean>;

  /**
   * Saves the enable passkeys setting to disk.
   * @param value The new value for the passkeys setting.
   */
  setEnablePasskeys: (value: boolean) => Promise<void>;
}
