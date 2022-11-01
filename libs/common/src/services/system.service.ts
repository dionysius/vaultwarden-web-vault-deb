import { firstValueFrom } from "rxjs";

import { AuthService } from "../abstractions/auth.service";
import { MessagingService } from "../abstractions/messaging.service";
import { PlatformUtilsService } from "../abstractions/platformUtils.service";
import { StateService } from "../abstractions/state.service";
import { SystemService as SystemServiceAbstraction } from "../abstractions/system.service";
import { AuthenticationStatus } from "../enums/authenticationStatus";
import { Utils } from "../misc/utils";

export class SystemService implements SystemServiceAbstraction {
  private reloadInterval: any = null;
  private clearClipboardTimeout: any = null;
  private clearClipboardTimeoutFunction: () => Promise<any> = null;

  constructor(
    private messagingService: MessagingService,
    private platformUtilsService: PlatformUtilsService,
    private reloadCallback: () => Promise<void> = null,
    private stateService: StateService
  ) {}

  async startProcessReload(authService: AuthService): Promise<void> {
    const accounts = await firstValueFrom(this.stateService.accounts$);
    if (accounts != null) {
      const keys = Object.keys(accounts);
      if (keys.length > 0) {
        for (const userId of keys) {
          if ((await authService.getAuthStatus(userId)) === AuthenticationStatus.Unlocked) {
            return;
          }
        }
      }
    }

    // A reloadInterval has already been set and is executing
    if (this.reloadInterval != null) {
      return;
    }

    // User has set a PIN, with ask for master password on restart, to protect their vault
    const decryptedPinProtected = await this.stateService.getDecryptedPinProtected();
    if (decryptedPinProtected != null) {
      return;
    }

    this.cancelProcessReload();
    this.reloadInterval = setInterval(async () => await this.executeProcessReload(), 10000);
  }

  private async inactiveMoreThanSeconds(seconds: number): Promise<boolean> {
    const lastActive = await this.stateService.getLastActive();
    if (lastActive != null) {
      const diffMs = new Date().getTime() - lastActive;
      return diffMs >= seconds * 1000;
    }
    return true;
  }

  private async executeProcessReload() {
    const accounts = await firstValueFrom(this.stateService.accounts$);
    const doRefresh =
      accounts == null ||
      Object.keys(accounts).length == 0 ||
      (await this.inactiveMoreThanSeconds(5));

    const biometricLockedFingerprintValidated =
      await this.stateService.getBiometricFingerprintValidated();
    if (doRefresh && !biometricLockedFingerprintValidated) {
      clearInterval(this.reloadInterval);
      this.reloadInterval = null;
      this.messagingService.send("reloadProcess");
      if (this.reloadCallback != null) {
        await this.reloadCallback();
      }
    }
  }

  cancelProcessReload(): void {
    if (this.reloadInterval != null) {
      clearInterval(this.reloadInterval);
      this.reloadInterval = null;
    }
  }

  async clearClipboard(clipboardValue: string, timeoutMs: number = null): Promise<void> {
    if (this.clearClipboardTimeout != null) {
      clearTimeout(this.clearClipboardTimeout);
      this.clearClipboardTimeout = null;
    }
    if (Utils.isNullOrWhitespace(clipboardValue)) {
      return;
    }
    await this.stateService.getClearClipboard().then((clearSeconds) => {
      if (clearSeconds == null) {
        return;
      }
      if (timeoutMs == null) {
        timeoutMs = clearSeconds * 1000;
      }
      this.clearClipboardTimeoutFunction = async () => {
        const clipboardValueNow = await this.platformUtilsService.readFromClipboard();
        if (clipboardValue === clipboardValueNow) {
          this.platformUtilsService.copyToClipboard("", { clearing: true });
        }
      };
      this.clearClipboardTimeout = setTimeout(async () => {
        await this.clearPendingClipboard();
      }, timeoutMs);
    });
  }

  async clearPendingClipboard() {
    if (this.clearClipboardTimeoutFunction != null) {
      await this.clearClipboardTimeoutFunction();
      this.clearClipboardTimeoutFunction = null;
    }
  }
}
