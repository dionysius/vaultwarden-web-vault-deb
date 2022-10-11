import { AutofillService as AbstractAutoFillService } from "../../services/abstractions/autofill.service";
import AutofillService from "../../services/autofill.service";

import { cipherServiceFactory, CipherServiceInitOptions } from "./cipher-service.factory";
import { EventServiceInitOptions, eventServiceFactory } from "./event-service.factory";
import { CachedServices, factory, FactoryOptions } from "./factory-options";
import { logServiceFactory, LogServiceInitOptions } from "./log-service.factory";
import { stateServiceFactory, StateServiceInitOptions } from "./state-service.factory";
import { totpServiceFactory, TotpServiceInitOptions } from "./totp-service.factory";

type AutoFillServiceOptions = FactoryOptions;

export type AutoFillServiceInitOptions = AutoFillServiceOptions &
  CipherServiceInitOptions &
  StateServiceInitOptions &
  TotpServiceInitOptions &
  EventServiceInitOptions &
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
        await eventServiceFactory(cache, opts),
        await logServiceFactory(cache, opts)
      )
  );
}
