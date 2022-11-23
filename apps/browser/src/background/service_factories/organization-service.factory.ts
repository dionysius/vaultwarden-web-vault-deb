import { OrganizationService as AbstractOrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";

import { BrowserOrganizationService } from "../../services/browser-organization.service";

import { FactoryOptions, CachedServices, factory } from "./factory-options";
import { stateServiceFactory, StateServiceInitOptions } from "./state-service.factory";

type OrganizationServiceFactoryOptions = FactoryOptions;

export type OrganizationServiceInitOptions = OrganizationServiceFactoryOptions &
  StateServiceInitOptions;

export function organizationServiceFactory(
  cache: { organizationService?: AbstractOrganizationService } & CachedServices,
  opts: OrganizationServiceInitOptions
): Promise<AbstractOrganizationService> {
  return factory(
    cache,
    "organizationService",
    opts,
    async () => new BrowserOrganizationService(await stateServiceFactory(cache, opts))
  );
}
