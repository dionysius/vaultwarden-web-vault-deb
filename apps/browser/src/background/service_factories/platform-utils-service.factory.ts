import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";

import BrowserPlatformUtilsService from "../../services/browserPlatformUtils.service";

import { CachedServices, factory, FactoryOptions } from "./factory-options";
import { MessagingServiceInitOptions, messagingServiceFactory } from "./messaging-service.factory";

type PlatformUtilsServiceFactoryOptions = FactoryOptions & {
  platformUtilsServiceOptions: {
    clipboardWriteCallback: (clipboardValue: string, clearMs: number) => Promise<void>;
    biometricCallback: () => Promise<boolean>;
    win: Window & typeof globalThis;
  };
};

export type PlatformUtilsServiceInitOptions = PlatformUtilsServiceFactoryOptions &
  MessagingServiceInitOptions;

export function platformUtilsServiceFactory(
  cache: { platformUtilsService?: PlatformUtilsService } & CachedServices,
  opts: PlatformUtilsServiceInitOptions
): Promise<PlatformUtilsService> {
  return factory(
    cache,
    "platformUtilsService",
    opts,
    async () =>
      new BrowserPlatformUtilsService(
        await messagingServiceFactory(cache, opts),
        opts.platformUtilsServiceOptions.clipboardWriteCallback,
        opts.platformUtilsServiceOptions.biometricCallback,
        opts.platformUtilsServiceOptions.win
      )
  );
}
