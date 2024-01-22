import { Directive } from "@angular/core";
import { FormBuilder } from "@angular/forms";

import { UserVerificationService } from "@bitwarden/common/auth/abstractions/user-verification/user-verification.service.abstraction";
import { Verification } from "@bitwarden/common/auth/types/verification";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";

import { ModalRef } from "../../components/modal/modal.ref";

export interface UserVerificationPromptParams {
  confirmDescription: string;
  confirmButtonText: string;
  modalTitle: string;
}

/**
 * Used to verify the user's identity (using their master password or email-based OTP for Key Connector users). You can customize all of the text in the modal.
 */
@Directive()
export class UserVerificationPromptComponent {
  confirmDescription = this.config.confirmDescription;
  confirmButtonText = this.config.confirmButtonText;
  modalTitle = this.config.modalTitle;

  formGroup = this.formBuilder.group({
    secret: this.formBuilder.control<Verification | null>(null),
  });

  protected invalidSecret = false;

  constructor(
    private modalRef: ModalRef,
    protected config: UserVerificationPromptParams,
    protected userVerificationService: UserVerificationService,
    private formBuilder: FormBuilder,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
  ) {}

  get secret() {
    return this.formGroup.controls.secret;
  }

  submit = async () => {
    this.formGroup.markAllAsTouched();

    if (this.formGroup.invalid) {
      return;
    }

    try {
      //Incorrect secret will throw an invalid password error.
      await this.userVerificationService.verifyUser(this.secret.value);
      this.invalidSecret = false;
    } catch (e) {
      this.invalidSecret = true;
      this.platformUtilsService.showToast("error", this.i18nService.t("error"), e.message);
      return;
    }

    this.close(true);
  };

  close(success: boolean) {
    this.modalRef.close(success);
  }
}
