import { SendService } from "@bitwarden/common/tools/send/services/send.service";
import { InternalSendService } from "@bitwarden/common/tools/send/services/send.service.abstraction";

import {
  CryptoServiceInitOptions,
  cryptoServiceFactory,
} from "../../platform/background/service-factories/crypto-service.factory";
import {
  EncryptServiceInitOptions,
  encryptServiceFactory,
} from "../../platform/background/service-factories/encrypt-service.factory";
import {
  FactoryOptions,
  CachedServices,
  factory,
} from "../../platform/background/service-factories/factory-options";
import {
  i18nServiceFactory,
  I18nServiceInitOptions,
} from "../../platform/background/service-factories/i18n-service.factory";
import {
  KeyGenerationServiceInitOptions,
  keyGenerationServiceFactory,
} from "../../platform/background/service-factories/key-generation-service.factory";

import {
  SendStateProviderInitOptions,
  sendStateProviderFactory,
} from "./send-state-provider.factory";

type SendServiceFactoryOptions = FactoryOptions;

export type SendServiceInitOptions = SendServiceFactoryOptions &
  CryptoServiceInitOptions &
  I18nServiceInitOptions &
  KeyGenerationServiceInitOptions &
  SendStateProviderInitOptions &
  EncryptServiceInitOptions;

export function sendServiceFactory(
  cache: { sendService?: InternalSendService } & CachedServices,
  opts: SendServiceInitOptions,
): Promise<InternalSendService> {
  return factory(
    cache,
    "sendService",
    opts,
    async () =>
      new SendService(
        await cryptoServiceFactory(cache, opts),
        await i18nServiceFactory(cache, opts),
        await keyGenerationServiceFactory(cache, opts),
        await sendStateProviderFactory(cache, opts),
        await encryptServiceFactory(cache, opts),
      ),
  );
}
