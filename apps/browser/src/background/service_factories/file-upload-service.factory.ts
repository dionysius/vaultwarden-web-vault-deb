import { FileUploadService as FileUploadServiceAbstraction } from "@bitwarden/common/abstractions/file-upload/file-upload.service";
import { FileUploadService } from "@bitwarden/common/services/file-upload/file-upload.service";

import { CachedServices, factory, FactoryOptions } from "./factory-options";
import { logServiceFactory, LogServiceInitOptions } from "./log-service.factory";

type FileUploadServiceFactoryOptions = FactoryOptions;

export type FileUploadServiceInitOptions = FileUploadServiceFactoryOptions & LogServiceInitOptions;

export function fileUploadServiceFactory(
  cache: { fileUploadService?: FileUploadServiceAbstraction } & CachedServices,
  opts: FileUploadServiceInitOptions
): Promise<FileUploadServiceAbstraction> {
  return factory(
    cache,
    "fileUploadService",
    opts,
    async () => new FileUploadService(await logServiceFactory(cache, opts))
  );
}
