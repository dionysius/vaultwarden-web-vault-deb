import { concatMap, firstValueFrom, shareReplay } from "rxjs";

import { LogLevel, DeviceType as SdkDeviceType } from "@bitwarden/sdk-internal";

import { ApiService } from "../../../abstractions/api.service";
import { DeviceType } from "../../../enums/device-type.enum";
import { EnvironmentService } from "../../abstractions/environment.service";
import { PlatformUtilsService } from "../../abstractions/platform-utils.service";
import { SdkClientFactory } from "../../abstractions/sdk/sdk-client-factory";
import { SdkService } from "../../abstractions/sdk/sdk.service";

export class DefaultSdkService implements SdkService {
  client$ = this.environmentService.environment$.pipe(
    concatMap(async (env) => {
      const settings = {
        apiUrl: env.getApiUrl(),
        identityUrl: env.getIdentityUrl(),
        deviceType: this.toDevice(this.platformUtilsService.getDevice()),
        userAgent: this.userAgent ?? navigator.userAgent,
      };

      return await this.sdkClientFactory.createSdkClient(settings, LogLevel.Info);
    }),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  supported$ = this.client$.pipe(
    concatMap(async (client) => {
      return client.echo("bitwarden wasm!") === "bitwarden wasm!";
    }),
  );

  constructor(
    private sdkClientFactory: SdkClientFactory,
    private environmentService: EnvironmentService,
    private platformUtilsService: PlatformUtilsService,
    private apiService: ApiService, // Yes we shouldn't import ApiService, but it's temporary
    private userAgent: string = null,
  ) {}

  async failedToInitialize(): Promise<void> {
    // Only log on cloud instances
    if (
      this.platformUtilsService.isDev() ||
      !(await firstValueFrom(this.environmentService.environment$)).isCloud
    ) {
      return;
    }

    return this.apiService.send("POST", "/wasm-debug", null, false, false, null, (headers) => {
      headers.append("SDK-Version", "1.0.0");
    });
  }

  private toDevice(device: DeviceType): SdkDeviceType {
    switch (device) {
      case DeviceType.Android:
        return "Android";
      case DeviceType.iOS:
        return "iOS";
      case DeviceType.ChromeExtension:
        return "ChromeExtension";
      case DeviceType.FirefoxExtension:
        return "FirefoxExtension";
      case DeviceType.OperaExtension:
        return "OperaExtension";
      case DeviceType.EdgeExtension:
        return "EdgeExtension";
      case DeviceType.WindowsDesktop:
        return "WindowsDesktop";
      case DeviceType.MacOsDesktop:
        return "MacOsDesktop";
      case DeviceType.LinuxDesktop:
        return "LinuxDesktop";
      case DeviceType.ChromeBrowser:
        return "ChromeBrowser";
      case DeviceType.FirefoxBrowser:
        return "FirefoxBrowser";
      case DeviceType.OperaBrowser:
        return "OperaBrowser";
      case DeviceType.EdgeBrowser:
        return "EdgeBrowser";
      case DeviceType.IEBrowser:
        return "IEBrowser";
      case DeviceType.UnknownBrowser:
        return "UnknownBrowser";
      case DeviceType.AndroidAmazon:
        return "AndroidAmazon";
      case DeviceType.UWP:
        return "UWP";
      case DeviceType.SafariBrowser:
        return "SafariBrowser";
      case DeviceType.VivaldiBrowser:
        return "VivaldiBrowser";
      case DeviceType.VivaldiExtension:
        return "VivaldiExtension";
      case DeviceType.SafariExtension:
        return "SafariExtension";
      case DeviceType.Server:
        return "Server";
      case DeviceType.WindowsCLI:
        return "WindowsCLI";
      case DeviceType.MacOsCLI:
        return "MacOsCLI";
      case DeviceType.LinuxCLI:
        return "LinuxCLI";
      default:
        return "SDK";
    }
  }
}
