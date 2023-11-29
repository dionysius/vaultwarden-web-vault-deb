import { DiskStorageOptions } from "@koa/multer";

import { AppIdService as AbstractAppIdService } from "@bitwarden/common/platform/abstractions/app-id.service";
import { AppIdService } from "@bitwarden/common/platform/services/app-id.service";

import { FactoryOptions, CachedServices, factory } from "./factory-options";
import { diskStorageServiceFactory } from "./storage-service.factory";

type AppIdServiceFactoryOptions = FactoryOptions;

export type AppIdServiceInitOptions = AppIdServiceFactoryOptions & DiskStorageOptions;

export function appIdServiceFactory(
  cache: { appIdService?: AbstractAppIdService } & CachedServices,
  opts: AppIdServiceInitOptions,
): Promise<AbstractAppIdService> {
  return factory(
    cache,
    "appIdService",
    opts,
    async () => new AppIdService(await diskStorageServiceFactory(cache, opts)),
  );
}
