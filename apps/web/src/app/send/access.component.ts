import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { CryptoFunctionService } from "@bitwarden/common/abstractions/cryptoFunction.service";
import { FileDownloadService } from "@bitwarden/common/abstractions/fileDownload/fileDownload.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { SEND_KDF_ITERATIONS } from "@bitwarden/common/enums/kdfType";
import { SendType } from "@bitwarden/common/enums/sendType";
import { Utils } from "@bitwarden/common/misc/utils";
import { EncArrayBuffer } from "@bitwarden/common/models/domain/encArrayBuffer";
import { SendAccess } from "@bitwarden/common/models/domain/sendAccess";
import { SymmetricCryptoKey } from "@bitwarden/common/models/domain/symmetricCryptoKey";
import { SendAccessRequest } from "@bitwarden/common/models/request/sendAccessRequest";
import { ErrorResponse } from "@bitwarden/common/models/response/errorResponse";
import { SendAccessResponse } from "@bitwarden/common/models/response/sendAccessResponse";
import { SendAccessView } from "@bitwarden/common/models/view/sendAccessView";

@Component({
  selector: "app-send-access",
  templateUrl: "access.component.html",
})
export class AccessComponent implements OnInit {
  send: SendAccessView;
  sendType = SendType;
  downloading = false;
  loading = true;
  passwordRequired = false;
  formPromise: Promise<SendAccessResponse>;
  password: string;
  showText = false;
  unavailable = false;
  error = false;
  hideEmail = false;

  private id: string;
  private key: string;
  private decKey: SymmetricCryptoKey;
  private accessRequest: SendAccessRequest;

  constructor(
    private i18nService: I18nService,
    private cryptoFunctionService: CryptoFunctionService,
    private apiService: ApiService,
    private platformUtilsService: PlatformUtilsService,
    private route: ActivatedRoute,
    private cryptoService: CryptoService,
    private fileDownloadService: FileDownloadService
  ) {}

  get sendText() {
    if (this.send == null || this.send.text == null) {
      return null;
    }
    return this.showText ? this.send.text.text : this.send.text.maskedText;
  }

  get expirationDate() {
    if (this.send == null || this.send.expirationDate == null) {
      return null;
    }
    return this.send.expirationDate;
  }

  get creatorIdentifier() {
    if (this.send == null || this.send.creatorIdentifier == null) {
      return null;
    }
    return this.send.creatorIdentifier;
  }

  ngOnInit() {
    this.route.params.subscribe(async (params) => {
      this.id = params.sendId;
      this.key = params.key;
      if (this.key == null || this.id == null) {
        return;
      }
      await this.load();
    });
  }

  async download() {
    if (this.send == null || this.decKey == null) {
      return;
    }

    if (this.downloading) {
      return;
    }

    const downloadData = await this.apiService.getSendFileDownloadData(
      this.send,
      this.accessRequest
    );

    if (Utils.isNullOrWhitespace(downloadData.url)) {
      this.platformUtilsService.showToast("error", null, this.i18nService.t("missingSendFile"));
      return;
    }

    this.downloading = true;
    const response = await fetch(new Request(downloadData.url, { cache: "no-store" }));
    if (response.status !== 200) {
      this.platformUtilsService.showToast("error", null, this.i18nService.t("errorOccurred"));
      this.downloading = false;
      return;
    }

    try {
      const encBuf = await EncArrayBuffer.fromResponse(response);
      const decBuf = await this.cryptoService.decryptFromBytes(encBuf, this.decKey);
      this.fileDownloadService.download({
        fileName: this.send.file.fileName,
        blobData: decBuf,
        downloadMethod: "save",
      });
    } catch (e) {
      this.platformUtilsService.showToast("error", null, this.i18nService.t("errorOccurred"));
    }

    this.downloading = false;
  }

  copyText() {
    this.platformUtilsService.copyToClipboard(this.send.text.text);
    this.platformUtilsService.showToast(
      "success",
      null,
      this.i18nService.t("valueCopied", this.i18nService.t("sendTypeText"))
    );
  }

  toggleText() {
    this.showText = !this.showText;
  }

  async load() {
    this.unavailable = false;
    this.error = false;
    this.hideEmail = false;
    const keyArray = Utils.fromUrlB64ToArray(this.key);
    this.accessRequest = new SendAccessRequest();
    if (this.password != null) {
      const passwordHash = await this.cryptoFunctionService.pbkdf2(
        this.password,
        keyArray,
        "sha256",
        SEND_KDF_ITERATIONS
      );
      this.accessRequest.password = Utils.fromBufferToB64(passwordHash);
    }
    try {
      let sendResponse: SendAccessResponse = null;
      if (this.loading) {
        sendResponse = await this.apiService.postSendAccess(this.id, this.accessRequest);
      } else {
        this.formPromise = this.apiService.postSendAccess(this.id, this.accessRequest);
        sendResponse = await this.formPromise;
      }
      this.passwordRequired = false;
      const sendAccess = new SendAccess(sendResponse);
      this.decKey = await this.cryptoService.makeSendKey(keyArray);
      this.send = await sendAccess.decrypt(this.decKey);
      this.showText = this.send.text != null ? !this.send.text.hidden : true;
    } catch (e) {
      if (e instanceof ErrorResponse) {
        if (e.statusCode === 401) {
          this.passwordRequired = true;
        } else if (e.statusCode === 404) {
          this.unavailable = true;
        } else {
          this.error = true;
        }
      }
    }
    this.loading = false;
    this.hideEmail =
      this.creatorIdentifier == null &&
      !this.passwordRequired &&
      !this.loading &&
      !this.unavailable;
  }
}
