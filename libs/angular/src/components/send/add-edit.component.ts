import { DatePipe } from "@angular/common";
import { Directive, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { Subject, takeUntil } from "rxjs";

import { EnvironmentService } from "@bitwarden/common/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { PolicyService } from "@bitwarden/common/abstractions/policy/policy.service.abstraction";
import { SendService } from "@bitwarden/common/abstractions/send.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { PolicyType } from "@bitwarden/common/enums/policyType";
import { SendType } from "@bitwarden/common/enums/sendType";
import { EncArrayBuffer } from "@bitwarden/common/models/domain/enc-array-buffer";
import { Send } from "@bitwarden/common/models/domain/send";
import { SendFileView } from "@bitwarden/common/models/view/send-file.view";
import { SendTextView } from "@bitwarden/common/models/view/send-text.view";
import { SendView } from "@bitwarden/common/models/view/send.view";

@Directive()
export class AddEditComponent implements OnInit, OnDestroy {
  @Input() sendId: string;
  @Input() type: SendType;

  @Output() onSavedSend = new EventEmitter<SendView>();
  @Output() onDeletedSend = new EventEmitter<SendView>();
  @Output() onCancelled = new EventEmitter<SendView>();

  copyLink = false;
  disableSend = false;
  disableHideEmail = false;
  send: SendView;
  deletionDate: string;
  expirationDate: string;
  hasPassword: boolean;
  password: string;
  showPassword = false;
  formPromise: Promise<any>;
  deletePromise: Promise<any>;
  sendType = SendType;
  typeOptions: any[];
  canAccessPremium = true;
  emailVerified = true;
  alertShown = false;
  showOptions = false;

  private sendLinkBaseUrl: string;
  private destroy$ = new Subject<void>();

  constructor(
    protected i18nService: I18nService,
    protected platformUtilsService: PlatformUtilsService,
    protected environmentService: EnvironmentService,
    protected datePipe: DatePipe,
    protected sendService: SendService,
    protected messagingService: MessagingService,
    protected policyService: PolicyService,
    private logService: LogService,
    protected stateService: StateService
  ) {
    this.typeOptions = [
      { name: i18nService.t("sendTypeFile"), value: SendType.File },
      { name: i18nService.t("sendTypeText"), value: SendType.Text },
    ];
    this.sendLinkBaseUrl = this.environmentService.getSendUrl();
  }

  get link(): string {
    if (this.send.id != null && this.send.accessId != null) {
      return this.sendLinkBaseUrl + this.send.accessId + "/" + this.send.urlB64Key;
    }
    return null;
  }

  get isSafari() {
    return this.platformUtilsService.isSafari();
  }

  get isDateTimeLocalSupported(): boolean {
    return !(this.platformUtilsService.isFirefox() || this.platformUtilsService.isSafari());
  }

  async ngOnInit() {
    this.policyService
      .policyAppliesToActiveUser$(PolicyType.DisableSend)
      .pipe(takeUntil(this.destroy$))
      .subscribe((policyAppliesToActiveUser) => {
        this.disableSend = policyAppliesToActiveUser;
      });

    this.policyService
      .policyAppliesToActiveUser$(PolicyType.SendOptions, (p) => p.data.disableHideEmail)
      .pipe(takeUntil(this.destroy$))
      .subscribe((policyAppliesToActiveUser) => {
        this.disableHideEmail = policyAppliesToActiveUser;
      });

    await this.load();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get editMode(): boolean {
    return this.sendId != null;
  }

  get title(): string {
    return this.i18nService.t(this.editMode ? "editSend" : "createSend");
  }

  setDates(event: { deletionDate: string; expirationDate: string }) {
    this.deletionDate = event.deletionDate;
    this.expirationDate = event.expirationDate;
  }

  async load() {
    this.canAccessPremium = await this.stateService.getCanAccessPremium();
    this.emailVerified = await this.stateService.getEmailVerified();
    if (!this.canAccessPremium || !this.emailVerified) {
      this.type = SendType.Text;
    }

    if (this.send == null) {
      if (this.editMode) {
        const send = await this.loadSend();
        this.send = await send.decrypt();
      } else {
        this.send = new SendView();
        this.send.type = this.type == null ? SendType.File : this.type;
        this.send.file = new SendFileView();
        this.send.text = new SendTextView();
        this.send.deletionDate = new Date();
        this.send.deletionDate.setDate(this.send.deletionDate.getDate() + 7);
      }
    }

    this.hasPassword = this.send.password != null && this.send.password.trim() !== "";
  }

  async submit(): Promise<boolean> {
    if (this.disableSend) {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("sendDisabledWarning")
      );
      return false;
    }

    if (this.send.name == null || this.send.name === "") {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("nameRequired")
      );
      return false;
    }

    let file: File = null;
    if (this.send.type === SendType.File && !this.editMode) {
      const fileEl = document.getElementById("file") as HTMLInputElement;
      const files = fileEl.files;
      if (files == null || files.length === 0) {
        this.platformUtilsService.showToast(
          "error",
          this.i18nService.t("errorOccurred"),
          this.i18nService.t("selectFile")
        );
        return;
      }

      file = files[0];
      if (files[0].size > 524288000) {
        // 500 MB
        this.platformUtilsService.showToast(
          "error",
          this.i18nService.t("errorOccurred"),
          this.i18nService.t("maxFileSize")
        );
        return;
      }
    }

    if (this.password != null && this.password.trim() === "") {
      this.password = null;
    }

    this.formPromise = this.encryptSend(file).then(async (encSend) => {
      const uploadPromise = this.sendService.saveWithServer(encSend);
      await uploadPromise;
      if (this.send.id == null) {
        this.send.id = encSend[0].id;
      }
      if (this.send.accessId == null) {
        this.send.accessId = encSend[0].accessId;
      }
      this.onSavedSend.emit(this.send);
      if (this.copyLink && this.link != null) {
        const copySuccess = await this.copyLinkToClipboard(this.link);
        if (copySuccess ?? true) {
          this.platformUtilsService.showToast(
            "success",
            null,
            this.i18nService.t(this.editMode ? "editedSend" : "createdSend")
          );
        } else {
          await this.platformUtilsService.showDialog(
            this.i18nService.t(this.editMode ? "editedSend" : "createdSend"),
            null,
            this.i18nService.t("ok"),
            null,
            "success",
            null
          );
          await this.copyLinkToClipboard(this.link);
        }
      }
    });
    try {
      await this.formPromise;
      return true;
    } catch (e) {
      this.logService.error(e);
    }
    return false;
  }

  async copyLinkToClipboard(link: string): Promise<void | boolean> {
    return Promise.resolve(this.platformUtilsService.copyToClipboard(link));
  }

  async delete(): Promise<boolean> {
    if (this.deletePromise != null) {
      return false;
    }
    const confirmed = await this.platformUtilsService.showDialog(
      this.i18nService.t("deleteSendConfirmation"),
      this.i18nService.t("deleteSend"),
      this.i18nService.t("yes"),
      this.i18nService.t("no"),
      "warning"
    );
    if (!confirmed) {
      return false;
    }

    try {
      this.deletePromise = this.sendService.deleteWithServer(this.send.id);
      await this.deletePromise;
      this.platformUtilsService.showToast("success", null, this.i18nService.t("deletedSend"));
      await this.load();
      this.onDeletedSend.emit(this.send);
      return true;
    } catch (e) {
      this.logService.error(e);
    }

    return false;
  }

  typeChanged() {
    if (this.send.type === SendType.File && !this.alertShown) {
      if (!this.canAccessPremium) {
        this.alertShown = true;
        this.messagingService.send("premiumRequired");
      } else if (!this.emailVerified) {
        this.alertShown = true;
        this.messagingService.send("emailVerificationRequired");
      }
    }
  }

  toggleOptions() {
    this.showOptions = !this.showOptions;
  }

  protected async loadSend(): Promise<Send> {
    return this.sendService.get(this.sendId);
  }

  protected async encryptSend(file: File): Promise<[Send, EncArrayBuffer]> {
    const sendData = await this.sendService.encrypt(this.send, file, this.password, null);

    // Parse dates
    try {
      sendData[0].deletionDate = this.deletionDate == null ? null : new Date(this.deletionDate);
    } catch {
      sendData[0].deletionDate = null;
    }
    try {
      sendData[0].expirationDate =
        this.expirationDate == null ? null : new Date(this.expirationDate);
    } catch {
      sendData[0].expirationDate = null;
    }

    return sendData;
  }

  protected togglePasswordVisible() {
    this.showPassword = !this.showPassword;
    document.getElementById("password").focus();
  }
}
