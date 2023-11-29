import { CipherFileUploadService as CipherFileUploadServiceAbstraction } from "@bitwarden/common/vault/abstractions/file-upload/cipher-file-upload.service";
import { CipherFileUploadService } from "@bitwarden/common/vault/services/file-upload/cipher-file-upload.service";

import {
  ApiServiceInitOptions,
  apiServiceFactory,
} from "../../platform/background/service-factories/api-service.factory";
import {
  FactoryOptions,
  CachedServices,
  factory,
} from "../../platform/background/service-factories/factory-options";
import {
  FileUploadServiceInitOptions,
  fileUploadServiceFactory,
} from "../../platform/background/service-factories/file-upload-service.factory";

type CipherFileUploadServiceFactoyOptions = FactoryOptions;

export type CipherFileUploadServiceInitOptions = CipherFileUploadServiceFactoyOptions &
  ApiServiceInitOptions &
  FileUploadServiceInitOptions;

export function cipherFileUploadServiceFactory(
  cache: { cipherFileUploadService?: CipherFileUploadServiceAbstraction } & CachedServices,
  opts: CipherFileUploadServiceInitOptions,
): Promise<CipherFileUploadServiceAbstraction> {
  return factory(
    cache,
    "cipherFileUploadService",
    opts,
    async () =>
      new CipherFileUploadService(
        await apiServiceFactory(cache, opts),
        await fileUploadServiceFactory(cache, opts),
      ),
  );
}
