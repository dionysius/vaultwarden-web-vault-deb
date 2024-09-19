import { CommonModule } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { SendView } from "@bitwarden/common/tools/send/models/view/send.view";
import {
  CardComponent,
  CheckboxModule,
  FormFieldModule,
  IconButtonModule,
  SectionComponent,
  SectionHeaderComponent,
  TypographyModule,
} from "@bitwarden/components";

import { SendFormConfig } from "../../abstractions/send-form-config.service";
import { SendFormContainer } from "../../send-form-container";

@Component({
  selector: "tools-send-options",
  templateUrl: "./send-options.component.html",
  standalone: true,
  imports: [
    SectionComponent,
    SectionHeaderComponent,
    TypographyModule,
    JslibModule,
    CardComponent,
    FormFieldModule,
    ReactiveFormsModule,
    IconButtonModule,
    CheckboxModule,
    CommonModule,
  ],
})
export class SendOptionsComponent implements OnInit {
  @Input({ required: true })
  config: SendFormConfig;
  @Input()
  originalSendView: SendView;
  sendOptionsForm = this.formBuilder.group({
    maxAccessCount: [null as number],
    accessCount: [null as number],
    notes: [null as string],
    password: [null as string],
    hideEmail: [false as boolean],
  });
  get hasPassword(): boolean {
    return (
      this.sendOptionsForm.value.password !== null && this.sendOptionsForm.value.password !== ""
    );
  }

  get shouldShowCount(): boolean {
    return this.config.mode === "edit" && this.sendOptionsForm.value.maxAccessCount !== null;
  }

  get viewsLeft(): number {
    return this.sendOptionsForm.value.maxAccessCount
      ? this.sendOptionsForm.value.maxAccessCount - this.sendOptionsForm.value.accessCount
      : 0;
  }

  constructor(
    private sendFormContainer: SendFormContainer,
    private formBuilder: FormBuilder,
  ) {
    this.sendFormContainer.registerChildForm("sendOptionsForm", this.sendOptionsForm);
    this.sendOptionsForm.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      this.sendFormContainer.patchSend((send) => {
        Object.assign(send, {
          maxAccessCount: value.maxAccessCount,
          accessCount: value.accessCount,
          password: value.password,
          hideEmail: value.hideEmail,
          notes: value.notes,
        });
        return send;
      });
    });
  }
  ngOnInit() {
    if (this.sendFormContainer.originalSendView) {
      this.sendOptionsForm.patchValue({
        maxAccessCount: this.sendFormContainer.originalSendView.maxAccessCount,
        accessCount: this.sendFormContainer.originalSendView.accessCount,
        password: this.sendFormContainer.originalSendView.password,
        hideEmail: this.sendFormContainer.originalSendView.hideEmail,
        notes: this.sendFormContainer.originalSendView.notes,
      });
    }
  }
}
