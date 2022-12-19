import { Component } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";

import { ModalRef } from "@bitwarden/angular/components/modal/modal.ref";

@Component({
  templateUrl: "file-password-prompt.component.html",
})
export class FilePasswordPromptComponent {
  filePassword = new FormControl("", Validators.required);

  constructor(private modalRef: ModalRef) {}

  submit() {
    this.filePassword.markAsTouched();
    if (!this.filePassword.valid) {
      return;
    }

    this.modalRef.close(this.filePassword.value);
  }

  cancel() {
    this.modalRef.close(null);
  }
}
