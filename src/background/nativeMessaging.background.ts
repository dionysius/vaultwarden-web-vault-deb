import { AppIdService } from "jslib-common/abstractions/appId.service";
import { AuthService } from "jslib-common/abstractions/auth.service";
import { CryptoService } from "jslib-common/abstractions/crypto.service";
import { CryptoFunctionService } from "jslib-common/abstractions/cryptoFunction.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { MessagingService } from "jslib-common/abstractions/messaging.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { AuthenticationStatus } from "jslib-common/enums/authenticationStatus";
import { Utils } from "jslib-common/misc/utils";
import { EncString } from "jslib-common/models/domain/encString";
import { SymmetricCryptoKey } from "jslib-common/models/domain/symmetricCryptoKey";

import { BrowserApi } from "../browser/browserApi";

import RuntimeBackground from "./runtime.background";

const MessageValidTimeout = 10 * 1000;
const EncryptionAlgorithm = "sha1";

type Message = {
  command: string;

  // Filled in by this service
  userId?: string;
  timestamp?: number;

  // Used for sharing secret
  publicKey?: string;
};

type OuterMessage = {
  message: Message | EncString;
  appId: string;
};

type ReceiveMessage = {
  timestamp: number;
  command: string;
  response?: any;

  // Unlock key
  keyB64?: string;
};

type ReceiveMessageOuter = {
  command: string;
  appId: string;

  // Should only have one of these.
  message?: EncString;
  sharedSecret?: string;
};

export class NativeMessagingBackground {
  private connected = false;
  private connecting: boolean;
  private port: browser.runtime.Port | chrome.runtime.Port;

  private resolver: any = null;
  private privateKey: ArrayBuffer = null;
  private publicKey: ArrayBuffer = null;
  private secureSetupResolve: any = null;
  private sharedSecret: SymmetricCryptoKey;
  private appId: string;
  private validatingFingerprint: boolean;

  constructor(
    private cryptoService: CryptoService,
    private cryptoFunctionService: CryptoFunctionService,
    private runtimeBackground: RuntimeBackground,
    private i18nService: I18nService,
    private messagingService: MessagingService,
    private appIdService: AppIdService,
    private platformUtilsService: PlatformUtilsService,
    private stateService: StateService,
    private logService: LogService,
    private authService: AuthService
  ) {
    this.stateService.setBiometricFingerprintValidated(false);

    if (chrome?.permissions?.onAdded) {
      // Reload extension to activate nativeMessaging
      chrome.permissions.onAdded.addListener((permissions) => {
        BrowserApi.reloadExtension(null);
      });
    }
  }

  async connect() {
    this.appId = await this.appIdService.getAppId();
    this.stateService.setBiometricFingerprintValidated(false);

    return new Promise<void>((resolve, reject) => {
      this.port = BrowserApi.connectNative("com.8bit.bitwarden");

      this.connecting = true;

      const connectedCallback = () => {
        this.connected = true;
        this.connecting = false;
        resolve();
      };

      // Safari has a bundled native component which is always available, no need to
      // check if the desktop app is running.
      if (this.platformUtilsService.isSafari()) {
        connectedCallback();
      }

      this.port.onMessage.addListener(async (message: ReceiveMessageOuter) => {
        switch (message.command) {
          case "connected":
            connectedCallback();
            break;
          case "disconnected":
            if (this.connecting) {
              reject("startDesktop");
            }
            this.connected = false;
            this.port.disconnect();
            break;
          case "setupEncryption": {
            // Ignore since it belongs to another device
            if (message.appId !== this.appId) {
              return;
            }

            const encrypted = Utils.fromB64ToArray(message.sharedSecret);
            const decrypted = await this.cryptoFunctionService.rsaDecrypt(
              encrypted.buffer,
              this.privateKey,
              EncryptionAlgorithm
            );

            if (this.validatingFingerprint) {
              this.validatingFingerprint = false;
              this.stateService.setBiometricFingerprintValidated(true);
            }
            this.sharedSecret = new SymmetricCryptoKey(decrypted);
            this.secureSetupResolve();
            break;
          }
          case "invalidateEncryption":
            // Ignore since it belongs to another device
            if (message.appId !== this.appId) {
              return;
            }

            this.sharedSecret = null;
            this.privateKey = null;
            this.connected = false;

            this.messagingService.send("showDialog", {
              text: this.i18nService.t("nativeMessagingInvalidEncryptionDesc"),
              title: this.i18nService.t("nativeMessagingInvalidEncryptionTitle"),
              confirmText: this.i18nService.t("ok"),
              type: "error",
            });
            break;
          case "verifyFingerprint": {
            if (this.sharedSecret == null) {
              this.validatingFingerprint = true;
              this.showFingerprintDialog();
            }
            break;
          }
          case "wrongUserId":
            this.showWrongUserDialog();
            break;
          default:
            // Ignore since it belongs to another device
            if (!this.platformUtilsService.isSafari() && message.appId !== this.appId) {
              return;
            }

            this.onMessage(message.message);
        }
      });

      this.port.onDisconnect.addListener((p: any) => {
        let error;
        if (BrowserApi.isWebExtensionsApi) {
          error = p.error.message;
        } else {
          error = chrome.runtime.lastError.message;
        }

        this.sharedSecret = null;
        this.privateKey = null;
        this.connected = false;

        const reason = error != null ? "desktopIntegrationDisabled" : null;
        reject(reason);
      });
    });
  }

  showWrongUserDialog() {
    this.messagingService.send("showDialog", {
      text: this.i18nService.t("nativeMessagingWrongUserDesc"),
      title: this.i18nService.t("nativeMessagingWrongUserTitle"),
      confirmText: this.i18nService.t("ok"),
      type: "error",
    });
  }

  async send(message: Message) {
    if (!this.connected) {
      await this.connect();
    }

    message.userId = await this.stateService.getUserId();
    message.timestamp = Date.now();

    if (this.platformUtilsService.isSafari()) {
      this.postMessage(message as any);
    } else {
      this.postMessage({ appId: this.appId, message: await this.encryptMessage(message) });
    }
  }

  async encryptMessage(message: Message) {
    if (this.sharedSecret == null) {
      await this.secureCommunication();
    }

    return await this.cryptoService.encrypt(JSON.stringify(message), this.sharedSecret);
  }

  getResponse(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.resolver = resolve;
    });
  }

  private postMessage(message: OuterMessage) {
    // Wrap in try-catch to when the port disconnected without triggering `onDisconnect`.
    try {
      this.port.postMessage(message);
    } catch (e) {
      this.logService.error("NativeMessaging port disconnected, disconnecting.");

      this.sharedSecret = null;
      this.privateKey = null;
      this.connected = false;

      this.messagingService.send("showDialog", {
        text: this.i18nService.t("nativeMessagingInvalidEncryptionDesc"),
        title: this.i18nService.t("nativeMessagingInvalidEncryptionTitle"),
        confirmText: this.i18nService.t("ok"),
        type: "error",
      });
    }
  }

  private async onMessage(rawMessage: ReceiveMessage | EncString) {
    let message = rawMessage as ReceiveMessage;
    if (!this.platformUtilsService.isSafari()) {
      message = JSON.parse(
        await this.cryptoService.decryptToUtf8(rawMessage as EncString, this.sharedSecret)
      );
    }

    if (Math.abs(message.timestamp - Date.now()) > MessageValidTimeout) {
      this.logService.error("NativeMessage is to old, ignoring.");
      return;
    }

    switch (message.command) {
      case "biometricUnlock": {
        await this.stateService.setBiometricAwaitingAcceptance(null);

        if (message.response === "not enabled") {
          this.messagingService.send("showDialog", {
            text: this.i18nService.t("biometricsNotEnabledDesc"),
            title: this.i18nService.t("biometricsNotEnabledTitle"),
            confirmText: this.i18nService.t("ok"),
            type: "error",
          });
          break;
        } else if (message.response === "not supported") {
          this.messagingService.send("showDialog", {
            text: this.i18nService.t("biometricsNotSupportedDesc"),
            title: this.i18nService.t("biometricsNotSupportedTitle"),
            confirmText: this.i18nService.t("ok"),
            type: "error",
          });
          break;
        }

        const enabled = await this.stateService.getBiometricUnlock();
        if (enabled === null || enabled === false) {
          if (message.response === "unlocked") {
            await this.stateService.setBiometricUnlock(true);
          }
          break;
        }

        // Ignore unlock if already unlocked
        if ((await this.authService.getAuthStatus()) === AuthenticationStatus.Unlocked) {
          break;
        }

        if (message.response === "unlocked") {
          await this.cryptoService.setKey(
            new SymmetricCryptoKey(Utils.fromB64ToArray(message.keyB64).buffer)
          );

          // Verify key is correct by attempting to decrypt a secret
          try {
            await this.cryptoService.getFingerprint(await this.stateService.getUserId());
          } catch (e) {
            this.logService.error("Unable to verify key: " + e);
            await this.cryptoService.clearKey();
            this.showWrongUserDialog();

            // Exit early
            if (this.resolver) {
              this.resolver(message);
            }
            return;
          }

          await this.stateService.setBiometricLocked(false);
          this.runtimeBackground.processMessage({ command: "unlocked" }, null, null);
        }
        break;
      }
      default:
        this.logService.error("NativeMessage, got unknown command: " + message.command);
        break;
    }

    if (this.resolver) {
      this.resolver(message);
    }
  }

  private async secureCommunication() {
    const [publicKey, privateKey] = await this.cryptoFunctionService.rsaGenerateKeyPair(2048);
    this.publicKey = publicKey;
    this.privateKey = privateKey;

    this.sendUnencrypted({
      command: "setupEncryption",
      publicKey: Utils.fromBufferToB64(publicKey),
      userId: await this.stateService.getUserId(),
    });

    return new Promise((resolve, reject) => (this.secureSetupResolve = resolve));
  }

  private async sendUnencrypted(message: Message) {
    if (!this.connected) {
      await this.connect();
    }

    message.timestamp = Date.now();

    this.postMessage({ appId: this.appId, message: message });
  }

  private async showFingerprintDialog() {
    const fingerprint = (
      await this.cryptoService.getFingerprint(await this.stateService.getUserId(), this.publicKey)
    ).join(" ");

    this.messagingService.send("showDialog", {
      html: `${this.i18nService.t(
        "desktopIntegrationVerificationText"
      )}<br><br><strong>${fingerprint}</strong>`,
      title: this.i18nService.t("desktopSyncVerificationTitle"),
      confirmText: this.i18nService.t("ok"),
      type: "warning",
    });
  }
}
