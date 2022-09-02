import { Inject, Injectable } from "@angular/core";

import { WINDOW } from "@bitwarden/angular/services/jslib-services.module";
import { AbstractThemingService } from "@bitwarden/angular/services/theming/theming.service.abstraction";
import { AbstractEncryptService } from "@bitwarden/common/abstractions/abstractEncrypt.service";
import { CryptoService as CryptoServiceAbstraction } from "@bitwarden/common/abstractions/crypto.service";
import { EnvironmentService as EnvironmentServiceAbstraction } from "@bitwarden/common/abstractions/environment.service";
import { EventService as EventServiceAbstraction } from "@bitwarden/common/abstractions/event.service";
import { I18nService as I18nServiceAbstraction } from "@bitwarden/common/abstractions/i18n.service";
import { NotificationsService as NotificationsServiceAbstraction } from "@bitwarden/common/abstractions/notifications.service";
import { PlatformUtilsService as PlatformUtilsServiceAbstraction } from "@bitwarden/common/abstractions/platformUtils.service";
import { StateService as StateServiceAbstraction } from "@bitwarden/common/abstractions/state.service";
import { SyncService as SyncServiceAbstraction } from "@bitwarden/common/abstractions/sync/sync.service.abstraction";
import { TwoFactorService as TwoFactorServiceAbstraction } from "@bitwarden/common/abstractions/twoFactor.service";
import { VaultTimeoutService as VaultTimeoutServiceAbstraction } from "@bitwarden/common/abstractions/vaultTimeout/vaultTimeout.service";
import { ContainerService } from "@bitwarden/common/services/container.service";
import { EventService } from "@bitwarden/common/services/event.service";
import { VaultTimeoutService } from "@bitwarden/common/services/vaultTimeout/vaultTimeout.service";

import { I18nService } from "../../services/i18n.service";
import { NativeMessagingService } from "../../services/nativeMessaging.service";

@Injectable()
export class InitService {
  constructor(
    @Inject(WINDOW) private win: Window,
    private environmentService: EnvironmentServiceAbstraction,
    private syncService: SyncServiceAbstraction,
    private vaultTimeoutService: VaultTimeoutServiceAbstraction,
    private i18nService: I18nServiceAbstraction,
    private eventService: EventServiceAbstraction,
    private twoFactorService: TwoFactorServiceAbstraction,
    private notificationsService: NotificationsServiceAbstraction,
    private platformUtilsService: PlatformUtilsServiceAbstraction,
    private stateService: StateServiceAbstraction,
    private cryptoService: CryptoServiceAbstraction,
    private nativeMessagingService: NativeMessagingService,
    private themingService: AbstractThemingService,
    private encryptService: AbstractEncryptService
  ) {}

  init() {
    return async () => {
      this.nativeMessagingService.init();
      await this.stateService.init();
      await this.environmentService.setUrlsFromStorage();
      this.syncService.fullSync(true);
      (this.vaultTimeoutService as VaultTimeoutService).init(true);
      const locale = await this.stateService.getLocale();
      await (this.i18nService as I18nService).init(locale);
      (this.eventService as EventService).init(true);
      this.twoFactorService.init();
      setTimeout(() => this.notificationsService.init(), 3000);
      const htmlEl = this.win.document.documentElement;
      htmlEl.classList.add("os_" + this.platformUtilsService.getDeviceString());
      await this.themingService.monitorThemeChanges();
      let installAction = null;
      const installedVersion = await this.stateService.getInstalledVersion();
      const currentVersion = await this.platformUtilsService.getApplicationVersion();
      if (installedVersion == null) {
        installAction = "install";
      } else if (installedVersion !== currentVersion) {
        installAction = "update";
      }

      if (installAction != null) {
        await this.stateService.setInstalledVersion(currentVersion);
      }

      const containerService = new ContainerService(this.cryptoService, this.encryptService);
      containerService.attachToGlobal(this.win);
    };
  }
}
