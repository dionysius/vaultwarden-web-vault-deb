import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";

import { EmergencyAccessService } from "../../emergency-access";
import { EmergencyAccessType } from "../../emergency-access/enums/emergency-access-type";

@Component({
  selector: "emergency-access-add-edit",
  templateUrl: "emergency-access-add-edit.component.html",
})
export class EmergencyAccessAddEditComponent implements OnInit {
  @Input() name: string;
  @Input() emergencyAccessId: string;
  @Output() onSaved = new EventEmitter();
  @Output() onDeleted = new EventEmitter();

  loading = true;
  readOnly = false;
  editMode = false;
  title: string;
  email: string;
  type: EmergencyAccessType = EmergencyAccessType.View;

  formPromise: Promise<any>;

  emergencyAccessType = EmergencyAccessType;
  waitTimes: { name: string; value: number }[];
  waitTime: number;

  constructor(
    private emergencyAccessService: EmergencyAccessService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private logService: LogService,
  ) {}

  async ngOnInit() {
    this.editMode = this.loading = this.emergencyAccessId != null;

    this.waitTimes = [
      { name: this.i18nService.t("oneDay"), value: 1 },
      { name: this.i18nService.t("days", "2"), value: 2 },
      { name: this.i18nService.t("days", "7"), value: 7 },
      { name: this.i18nService.t("days", "14"), value: 14 },
      { name: this.i18nService.t("days", "30"), value: 30 },
      { name: this.i18nService.t("days", "90"), value: 90 },
    ];

    if (this.editMode) {
      this.editMode = true;
      this.title = this.i18nService.t("editEmergencyContact");
      try {
        const emergencyAccess = await this.emergencyAccessService.getEmergencyAccess(
          this.emergencyAccessId,
        );
        this.type = emergencyAccess.type;
        this.waitTime = emergencyAccess.waitTimeDays;
      } catch (e) {
        this.logService.error(e);
      }
    } else {
      this.title = this.i18nService.t("inviteEmergencyContact");
      this.waitTime = this.waitTimes[2].value;
    }

    this.loading = false;
  }

  async submit() {
    try {
      if (this.editMode) {
        await this.emergencyAccessService.update(this.emergencyAccessId, this.type, this.waitTime);
      } else {
        await this.emergencyAccessService.invite(this.email, this.type, this.waitTime);
      }

      await this.formPromise;
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t(this.editMode ? "editedUserId" : "invitedUsers", this.name),
      );
      this.onSaved.emit();
    } catch (e) {
      this.logService.error(e);
    }
  }

  async delete() {
    this.onDeleted.emit();
  }
}
