import { DatePipe } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormBuilder, FormGroup, FormControl, Validators } from "@angular/forms";

import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { SendView } from "@bitwarden/common/tools/send/models/view/send.view";

import { SendFormConfig } from "../../abstractions/send-form-config.service";
import { SendFormContainer } from "../../send-form-container";

export type BaseSendDetailsForm = FormGroup<{
  name: FormControl<string>;
  selectedDeletionDatePreset: FormControl<string | number>;
}>;

// Value = hours
export enum DatePreset {
  OneHour = 1,
  OneDay = 24,
  TwoDays = 48,
  ThreeDays = 72,
  SevenDays = 168,
  FourteenDays = 336,
  ThirtyDays = 720,
}

export interface DatePresetSelectOption {
  name: string;
  value: DatePreset | string;
}

@Component({
  selector: "base-send-details-behavior",
  template: "",
})
export class BaseSendDetailsComponent implements OnInit {
  @Input() config: SendFormConfig;
  @Input() originalSendView?: SendView;

  sendDetailsForm: BaseSendDetailsForm;
  customDeletionDateOption: DatePresetSelectOption | null = null;
  datePresetOptions: DatePresetSelectOption[] = [];

  constructor(
    protected sendFormContainer: SendFormContainer,
    protected formBuilder: FormBuilder,
    protected i18nService: I18nService,
    protected datePipe: DatePipe,
  ) {
    this.sendDetailsForm = this.formBuilder.group({
      name: new FormControl("", Validators.required),
      selectedDeletionDatePreset: new FormControl(DatePreset.SevenDays || "", Validators.required),
    });

    this.sendDetailsForm.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      this.sendFormContainer.patchSend((send) => {
        return Object.assign(send, {
          name: value.name,
          deletionDate: new Date(this.formattedDeletionDate),
          expirationDate: new Date(this.formattedDeletionDate),
        } as SendView);
      });
    });
  }

  async ngOnInit() {
    this.setupDeletionDatePresets();

    if (this.originalSendView) {
      this.sendDetailsForm.patchValue({
        name: this.originalSendView.name,
        selectedDeletionDatePreset: this.originalSendView.deletionDate.toString(),
      });

      if (this.originalSendView.deletionDate) {
        this.customDeletionDateOption = {
          name: this.datePipe.transform(this.originalSendView.deletionDate, "MM/dd/yyyy, hh:mm a"),
          value: this.originalSendView.deletionDate.toString(),
        };
        this.datePresetOptions.unshift(this.customDeletionDateOption);
      }
    }
  }

  setupDeletionDatePresets() {
    const defaultSelections: DatePresetSelectOption[] = [
      { name: this.i18nService.t("oneHour"), value: DatePreset.OneHour },
      { name: this.i18nService.t("oneDay"), value: DatePreset.OneDay },
      { name: this.i18nService.t("days", "2"), value: DatePreset.TwoDays },
      { name: this.i18nService.t("days", "3"), value: DatePreset.ThreeDays },
      { name: this.i18nService.t("days", "7"), value: DatePreset.SevenDays },
      { name: this.i18nService.t("days", "14"), value: DatePreset.FourteenDays },
      { name: this.i18nService.t("days", "30"), value: DatePreset.ThirtyDays },
    ];

    this.datePresetOptions = defaultSelections;
  }

  get formattedDeletionDate(): string {
    const now = new Date();
    const selectedValue = this.sendDetailsForm.controls.selectedDeletionDatePreset.value;

    if (typeof selectedValue === "string") {
      return selectedValue;
    }

    const milliseconds = now.setTime(now.getTime() + (selectedValue as number) * 60 * 60 * 1000);
    return new Date(milliseconds).toString();
  }
}
