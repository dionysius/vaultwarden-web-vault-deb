import { CipherFileUploadService as CipherFileUploadServiceAbstraction } from "@bitwarden/common/vault/abstractions/file-upload/cipher-file-upload.service";
import { CipherFileUploadService } from "@bitwarden/common/vault/services/file-upload/cipher-file-upload.service";

import { apiServiceFactory, ApiServiceInitOptions } from "./api-service.factory";
import { FactoryOptions, CachedServices, factory } from "./factory-options";
import {
  fileUploadServiceFactory,
  FileUploadServiceInitOptions,
} from "./file-upload-service.factory";

type CipherFileUploadServiceFactoyOptions = FactoryOptions;

export type CipherFileUploadServiceInitOptions = CipherFileUploadServiceFactoyOptions &
  ApiServiceInitOptions &
  FileUploadServiceInitOptions;

export function cipherFileUploadServiceFactory(
  cache: { cipherFileUploadService?: CipherFileUploadServiceAbstraction } & CachedServices,
  opts: CipherFileUploadServiceInitOptions
): Promise<CipherFileUploadServiceAbstraction> {
  return factory(
    cache,
    "cipherFileUploadService",
    opts,
    async () =>
      new CipherFileUploadService(
        await apiServiceFactory(cache, opts),
        await fileUploadServiceFactory(cache, opts)
      )
  );
}
