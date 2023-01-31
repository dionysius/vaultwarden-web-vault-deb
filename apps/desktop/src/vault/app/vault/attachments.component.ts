import { Component } from "@angular/core";

import { AttachmentsComponent as BaseAttachmentsComponent } from "@bitwarden/angular/vault/components/attachments.component";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { FileDownloadService } from "@bitwarden/common/abstractions/fileDownload/fileDownload.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";

@Component({
  selector: "app-vault-attachments",
  templateUrl: "attachments.component.html",
})
export class AttachmentsComponent extends BaseAttachmentsComponent {
  constructor(
    cipherService: CipherService,
    i18nService: I18nService,
    cryptoService: CryptoService,
    platformUtilsService: PlatformUtilsService,
    apiService: ApiService,
    logService: LogService,
    stateService: StateService,
    fileDownloadService: FileDownloadService
  ) {
    super(
      cipherService,
      i18nService,
      cryptoService,
      platformUtilsService,
      apiService,
      window,
      logService,
      stateService,
      fileDownloadService
    );
  }
}
