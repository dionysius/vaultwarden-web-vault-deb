import { clipboard, ipcRenderer, shell } from "electron";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { ClientType } from "@bitwarden/common/enums/clientType";
import { DeviceType } from "@bitwarden/common/enums/deviceType";

import { isDev, isMacAppStore } from "../utils";

export class ElectronPlatformUtilsService implements PlatformUtilsService {
  private deviceCache: DeviceType = null;

  constructor(
    protected i18nService: I18nService,
    private messagingService: MessagingService,
    private clientType: ClientType.Desktop | ClientType.DirectoryConnector,
    private stateService: StateService
  ) {}

  getDevice(): DeviceType {
    if (!this.deviceCache) {
      switch (process.platform) {
        case "win32":
          this.deviceCache = DeviceType.WindowsDesktop;
          break;
        case "darwin":
          this.deviceCache = DeviceType.MacOsDesktop;
          break;
        case "linux":
        default:
          this.deviceCache = DeviceType.LinuxDesktop;
          break;
      }
    }

    return this.deviceCache;
  }

  getDeviceString(): string {
    const device = DeviceType[this.getDevice()].toLowerCase();
    return device.replace("desktop", "");
  }

  getClientType() {
    return this.clientType;
  }

  isFirefox(): boolean {
    return false;
  }

  isChrome(): boolean {
    return true;
  }

  isEdge(): boolean {
    return false;
  }

  isOpera(): boolean {
    return false;
  }

  isVivaldi(): boolean {
    return false;
  }

  isSafari(): boolean {
    return false;
  }

  isMacAppStore(): boolean {
    return isMacAppStore();
  }

  isViewOpen(): Promise<boolean> {
    return Promise.resolve(false);
  }

  launchUri(uri: string, options?: any): void {
    shell.openExternal(uri);
  }

  getApplicationVersion(): Promise<string> {
    return ipcRenderer.invoke("appVersion");
  }

  // Temporarily restricted to only Windows until https://github.com/electron/electron/pull/28349
  // has been merged and an updated electron build is available.
  supportsWebAuthn(win: Window): boolean {
    return process.platform === "win32";
  }

  supportsDuo(): boolean {
    return true;
  }

  showToast(
    type: "error" | "success" | "warning" | "info",
    title: string,
    text: string | string[],
    options?: any
  ): void {
    this.messagingService.send("showToast", {
      text: text,
      title: title,
      type: type,
      options: options,
    });
  }

  async showDialog(
    text: string,
    title?: string,
    confirmText?: string,
    cancelText?: string,
    type?: string
  ): Promise<boolean> {
    const buttons = [confirmText == null ? this.i18nService.t("ok") : confirmText];
    if (cancelText != null) {
      buttons.push(cancelText);
    }

    const result = await ipcRenderer.invoke("showMessageBox", {
      type: type,
      title: title,
      message: title,
      detail: text,
      buttons: buttons,
      cancelId: buttons.length === 2 ? 1 : null,
      defaultId: 0,
      noLink: true,
    });

    return Promise.resolve(result.response === 0);
  }

  isDev(): boolean {
    return isDev();
  }

  isSelfHost(): boolean {
    return false;
  }

  copyToClipboard(text: string, options?: any): void {
    const type = options ? options.type : null;
    const clearing = options ? !!options.clearing : false;
    const clearMs: number = options && options.clearMs ? options.clearMs : null;
    clipboard.writeText(text, type);
    if (!clearing) {
      this.messagingService.send("copiedToClipboard", {
        clipboardValue: text,
        clearMs: clearMs,
        type: type,
        clearing: clearing,
      });
    }
  }

  readFromClipboard(options?: any): Promise<string> {
    const type = options ? options.type : null;
    return Promise.resolve(clipboard.readText(type));
  }

  async supportsBiometric(): Promise<boolean> {
    return await this.stateService.getEnableBiometric();
  }

  authenticateBiometric(): Promise<boolean> {
    return new Promise((resolve) => {
      const val = ipcRenderer.sendSync("biometric", {
        action: "authenticate",
      });
      resolve(val);
    });
  }

  supportsSecureStorage(): boolean {
    return true;
  }
}
