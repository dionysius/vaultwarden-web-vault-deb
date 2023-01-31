import { EventCollectionService as AbstractEventCollectionService } from "@bitwarden/common/abstractions/event/event-collection.service";
import { EventCollectionService } from "@bitwarden/common/services/event/event-collection.service";

import {
  cipherServiceFactory,
  CipherServiceInitOptions,
} from "../../vault/background/service_factories/cipher-service.factory";

import {
  eventUploadServiceFactory,
  EventUploadServiceInitOptions,
} from "./event-upload-service.factory";
import { FactoryOptions, CachedServices, factory } from "./factory-options";
import {
  organizationServiceFactory,
  OrganizationServiceInitOptions,
} from "./organization-service.factory";
import { stateServiceFactory, StateServiceInitOptions } from "./state-service.factory";

type EventCollectionServiceOptions = FactoryOptions;

export type EventCollectionServiceInitOptions = EventCollectionServiceOptions &
  CipherServiceInitOptions &
  StateServiceInitOptions &
  OrganizationServiceInitOptions &
  EventUploadServiceInitOptions;

export function eventCollectionServiceFactory(
  cache: { eventCollectionService?: AbstractEventCollectionService } & CachedServices,
  opts: EventCollectionServiceInitOptions
): Promise<AbstractEventCollectionService> {
  return factory(
    cache,
    "eventCollectionService",
    opts,
    async () =>
      new EventCollectionService(
        await cipherServiceFactory(cache, opts),
        await stateServiceFactory(cache, opts),
        await organizationServiceFactory(cache, opts),
        await eventUploadServiceFactory(cache, opts)
      )
  );
}
