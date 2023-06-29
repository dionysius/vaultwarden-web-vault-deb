import { DialogRef } from "@angular/cdk/dialog";
import { Component } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";

@Component({
  templateUrl: "file-password-prompt.component.html",
})
export class FilePasswordPromptComponent {
  filePassword = new FormControl("", Validators.required);

  constructor(public dialogRef: DialogRef) {}

  submit() {
    this.filePassword.markAsTouched();
    if (!this.filePassword.valid) {
      return;
    }
    this.dialogRef.close(this.filePassword.value);
  }
}
