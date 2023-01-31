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
import { AttachmentView } from "@bitwarden/common/vault/models/view/attachment.view";

@Component({
  selector: "emergency-access-attachments",
  templateUrl: "../../vault/app/vault/attachments.component.html",
})
export class EmergencyAccessAttachmentsComponent extends BaseAttachmentsComponent {
  viewOnly = true;
  canAccessAttachments = true;

  constructor(
    cipherService: CipherService,
    i18nService: I18nService,
    cryptoService: CryptoService,
    stateService: StateService,
    platformUtilsService: PlatformUtilsService,
    apiService: ApiService,
    logService: LogService,
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

  protected async init() {
    // Do nothing since cipher is already decoded
  }

  protected showFixOldAttachments(attachment: AttachmentView) {
    return false;
  }
}
