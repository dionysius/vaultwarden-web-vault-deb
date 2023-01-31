import {
  EventCollectionServiceInitOptions,
  eventCollectionServiceFactory,
} from "../../../background/service_factories/event-collection-service.factory";
import {
  CachedServices,
  factory,
  FactoryOptions,
} from "../../../background/service_factories/factory-options";
import {
  logServiceFactory,
  LogServiceInitOptions,
} from "../../../background/service_factories/log-service.factory";
import {
  stateServiceFactory,
  StateServiceInitOptions,
} from "../../../background/service_factories/state-service.factory";
import {
  totpServiceFactory,
  TotpServiceInitOptions,
} from "../../../background/service_factories/totp-service.factory";
import {
  cipherServiceFactory,
  CipherServiceInitOptions,
} from "../../../vault/background/service_factories/cipher-service.factory";
import { AutofillService as AbstractAutoFillService } from "../../services/abstractions/autofill.service";
import AutofillService from "../../services/autofill.service";

type AutoFillServiceOptions = FactoryOptions;

export type AutoFillServiceInitOptions = AutoFillServiceOptions &
  CipherServiceInitOptions &
  StateServiceInitOptions &
  TotpServiceInitOptions &
  EventCollectionServiceInitOptions &
  LogServiceInitOptions;

export function autofillServiceFactory(
  cache: { autofillService?: AbstractAutoFillService } & CachedServices,
  opts: AutoFillServiceInitOptions
): Promise<AbstractAutoFillService> {
  return factory(
    cache,
    "autofillService",
    opts,
    async () =>
      new AutofillService(
        await cipherServiceFactory(cache, opts),
        await stateServiceFactory(cache, opts),
        await totpServiceFactory(cache, opts),
        await eventCollectionServiceFactory(cache, opts),
        await logServiceFactory(cache, opts)
      )
  );
}
