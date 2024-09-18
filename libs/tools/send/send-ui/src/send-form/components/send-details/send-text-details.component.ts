import { CommonModule } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { SendView } from "@bitwarden/common/tools/send/models/view/send.view";
import { CheckboxModule, FormFieldModule, SectionComponent } from "@bitwarden/components";

import { SendFormConfig } from "../../abstractions/send-form-config.service";
import { SendFormContainer } from "../../send-form-container";

import { BaseSendDetailsForm } from "./base-send-details.component";

type BaseSendTextDetailsForm = FormGroup<{
  text: FormControl<string>;
  hidden: FormControl<boolean>;
}>;

export type SendTextDetailsForm = BaseSendTextDetailsForm & BaseSendDetailsForm;

@Component({
  selector: "tools-send-text-details",
  templateUrl: "./send-text-details.component.html",
  standalone: true,
  imports: [
    CheckboxModule,
    CommonModule,
    JslibModule,
    ReactiveFormsModule,
    FormFieldModule,
    SectionComponent,
  ],
})
export class SendTextDetailsComponent implements OnInit {
  @Input() config: SendFormConfig;
  @Input() originalSendView?: SendView;
  @Input() sendDetailsForm: BaseSendDetailsForm;

  baseSendTextDetailsForm: BaseSendTextDetailsForm;
  sendTextDetailsForm: SendTextDetailsForm;

  constructor(
    private formBuilder: FormBuilder,
    protected sendFormContainer: SendFormContainer,
  ) {
    this.baseSendTextDetailsForm = this.formBuilder.group({
      text: new FormControl("", Validators.required),
      hidden: new FormControl(false),
    });

    this.sendTextDetailsForm = Object.assign(this.baseSendTextDetailsForm, this.sendDetailsForm);

    this.sendFormContainer.registerChildForm("sendTextDetailsForm", this.sendTextDetailsForm);

    this.sendTextDetailsForm.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      this.sendFormContainer.patchSend((send) => {
        return Object.assign(send, {
          text: {
            text: value.text,
            hidden: value.hidden,
          },
        });
      });
    });
  }

  ngOnInit() {
    if (this.originalSendView) {
      this.baseSendTextDetailsForm.patchValue({
        text: this.originalSendView.text?.text || "",
        hidden: this.originalSendView.text?.hidden || false,
      });
    }
  }
}
