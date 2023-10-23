import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import { CommonModule } from "@angular/common";
import { Component, Inject } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import {
  AsyncActionsModule,
  ButtonModule,
  DialogModule,
  DialogService,
  FormFieldModule,
  IconButtonModule,
  TypographyModule,
} from "@bitwarden/components";

type LastPassMultifactorPromptData = {
  isOOB?: boolean;
};

@Component({
  templateUrl: "lastpass-multifactor-prompt.component.html",
  standalone: true,
  imports: [
    CommonModule,
    JslibModule,
    ReactiveFormsModule,
    DialogModule,
    FormFieldModule,
    AsyncActionsModule,
    ButtonModule,
    IconButtonModule,
    TypographyModule,
  ],
})
export class LastPassMultifactorPromptComponent {
  protected description = this.data?.isOOB ? "lastPassOOBDesc" : "lastPassMFADesc";

  protected formGroup = new FormGroup({
    passcode: new FormControl("", {
      validators: Validators.required,
      updateOn: "submit",
    }),
  });

  constructor(
    public dialogRef: DialogRef,
    @Inject(DIALOG_DATA) protected data: LastPassMultifactorPromptData
  ) {}

  submit = () => {
    this.formGroup.markAsTouched();
    if (!this.formGroup.valid) {
      return;
    }
    this.dialogRef.close(this.formGroup.value.passcode);
  };

  static open(dialogService: DialogService, data?: LastPassMultifactorPromptData) {
    return dialogService.open<string>(LastPassMultifactorPromptComponent, { data });
  }
}
