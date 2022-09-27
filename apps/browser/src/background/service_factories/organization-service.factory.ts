import { OrganizationService as AbstractOrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { OrganizationService } from "@bitwarden/common/services/organization/organization.service";

import { FactoryOptions, CachedServices, factory } from "./factory-options";
import { stateServiceFactory, StateServiceInitOptions } from "./state-service.factory";
import {
  syncNotifierServiceFactory,
  SyncNotifierServiceInitOptions,
} from "./sync-notifier-service.factory";

type OrganizationServiceFactoryOptions = FactoryOptions;

export type OrganizationServiceInitOptions = OrganizationServiceFactoryOptions &
  SyncNotifierServiceInitOptions &
  StateServiceInitOptions;

export function organizationServiceFactory(
  cache: { organizationService?: AbstractOrganizationService } & CachedServices,
  opts: OrganizationServiceInitOptions
): Promise<AbstractOrganizationService> {
  return factory(
    cache,
    "organizationService",
    opts,
    async () =>
      new OrganizationService(
        await stateServiceFactory(cache, opts),
        await syncNotifierServiceFactory(cache, opts)
      )
  );
}
