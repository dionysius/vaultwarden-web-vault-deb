import { PolicyService as AbstractPolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";

import {
  CachedServices,
  factory,
  FactoryOptions,
} from "../../../platform/background/service-factories/factory-options";
import {
  stateServiceFactory as stateServiceFactory,
  StateServiceInitOptions,
} from "../../../platform/background/service-factories/state-service.factory";
import { BrowserPolicyService } from "../../services/browser-policy.service";

import {
  organizationServiceFactory,
  OrganizationServiceInitOptions,
} from "./organization-service.factory";

type PolicyServiceFactoryOptions = FactoryOptions;

export type PolicyServiceInitOptions = PolicyServiceFactoryOptions &
  StateServiceInitOptions &
  OrganizationServiceInitOptions;

export function policyServiceFactory(
  cache: { policyService?: AbstractPolicyService } & CachedServices,
  opts: PolicyServiceInitOptions,
): Promise<AbstractPolicyService> {
  return factory(
    cache,
    "policyService",
    opts,
    async () =>
      new BrowserPolicyService(
        await stateServiceFactory(cache, opts),
        await organizationServiceFactory(cache, opts),
      ),
  );
}
