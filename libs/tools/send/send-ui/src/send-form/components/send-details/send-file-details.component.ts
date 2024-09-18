import { CommonModule } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from "@angular/forms";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { SendType } from "@bitwarden/common/tools/send/enums/send-type";
import { SendFileView } from "@bitwarden/common/tools/send/models/view/send-file.view";
import { SendView } from "@bitwarden/common/tools/send/models/view/send.view";
import { ButtonModule, FormFieldModule, SectionComponent } from "@bitwarden/components";

import { SendFormConfig } from "../../abstractions/send-form-config.service";
import { SendFormContainer } from "../../send-form-container";

import { BaseSendDetailsForm } from "./base-send-details.component";

type BaseSendFileDetailsForm = FormGroup<{
  file: FormControl<SendFileView | null>;
}>;

export type SendFileDetailsForm = BaseSendFileDetailsForm & BaseSendDetailsForm;

@Component({
  selector: "tools-send-file-details",
  templateUrl: "./send-file-details.component.html",
  standalone: true,
  imports: [
    ButtonModule,
    CommonModule,
    JslibModule,
    ReactiveFormsModule,
    FormFieldModule,
    SectionComponent,
    FormsModule,
  ],
})
export class SendFileDetailsComponent implements OnInit {
  @Input() config: SendFormConfig;
  @Input() originalSendView?: SendView;
  @Input() sendDetailsForm: BaseSendDetailsForm;

  baseSendFileDetailsForm: BaseSendFileDetailsForm;
  sendFileDetailsForm: SendFileDetailsForm;

  FileSendType = SendType.File;
  fileName = "";

  constructor(
    private formBuilder: FormBuilder,
    protected sendFormContainer: SendFormContainer,
  ) {
    this.baseSendFileDetailsForm = this.formBuilder.group({
      file: this.formBuilder.control<SendFileView | null>(null, Validators.required),
    });

    this.sendFileDetailsForm = Object.assign(this.baseSendFileDetailsForm, this.sendDetailsForm);

    this.sendFormContainer.registerChildForm("sendFileDetailsForm", this.sendFileDetailsForm);

    this.sendFileDetailsForm.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      this.sendFormContainer.patchSend((send) => {
        return Object.assign(send, {
          file: value.file,
        });
      });
    });
  }

  onFileSelected = (event: Event): void => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }
    this.fileName = file.name;
    this.sendFormContainer.onFileSelected(file);
  };

  ngOnInit() {
    if (this.originalSendView) {
      this.sendFileDetailsForm.patchValue({
        file: this.originalSendView.file,
      });
    }
  }
}
