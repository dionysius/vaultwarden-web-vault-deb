import { InternalSendService } from "@bitwarden/common/abstractions/send/send.service.abstraction";

import { BrowserSendService } from "../../services/browser-send.service";

import { cryptoFunctionServiceFactory } from "./crypto-function-service.factory";
import { cryptoServiceFactory, CryptoServiceInitOptions } from "./crypto-service.factory";
import { FactoryOptions, CachedServices, factory } from "./factory-options";
import { i18nServiceFactory, I18nServiceInitOptions } from "./i18n-service.factory";
import { stateServiceFactory, StateServiceInitOptions } from "./state-service.factory";

type SendServiceFactoryOptions = FactoryOptions;

export type SendServiceInitOptions = SendServiceFactoryOptions &
  CryptoServiceInitOptions &
  I18nServiceInitOptions &
  StateServiceInitOptions;

export function sendServiceFactory(
  cache: { sendService?: InternalSendService } & CachedServices,
  opts: SendServiceInitOptions
): Promise<InternalSendService> {
  return factory(
    cache,
    "sendService",
    opts,
    async () =>
      new BrowserSendService(
        await cryptoServiceFactory(cache, opts),
        await i18nServiceFactory(cache, opts),
        await cryptoFunctionServiceFactory(cache, opts),
        await stateServiceFactory(cache, opts)
      )
  );
}
