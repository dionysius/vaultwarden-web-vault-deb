import { coerceBooleanProperty } from "@angular/cdk/coercion";
import { Component, ContentChild, HostBinding, Input } from "@angular/core";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";

import { BitFormControlAbstraction } from "./form-control.abstraction";

@Component({
  selector: "bit-form-control",
  templateUrl: "form-control.component.html",
})
export class FormControlComponent {
  @Input() label: string;

  private _inline = false;
  @Input() get inline() {
    return this._inline;
  }
  set inline(value: boolean | "") {
    this._inline = coerceBooleanProperty(value);
  }

  @ContentChild(BitFormControlAbstraction) protected formControl: BitFormControlAbstraction;

  @HostBinding("class") get classes() {
    return ["tw-mb-6"].concat(this.inline ? ["tw-inline-block", "tw-mr-4"] : ["tw-block"]);
  }

  constructor(private i18nService: I18nService) {}

  protected get labelClasses() {
    return ["tw-transition", "tw-select-none", "tw-mb-0"].concat(
      this.formControl.disabled ? "tw-cursor-auto" : "tw-cursor-pointer"
    );
  }

  protected get labelContentClasses() {
    return ["tw-font-semibold"].concat(
      this.formControl.disabled ? "tw-text-muted" : "tw-text-main"
    );
  }

  get required() {
    return this.formControl.required;
  }

  get hasError() {
    return this.formControl.hasError;
  }

  get error() {
    return this.formControl.error;
  }

  get displayError() {
    switch (this.error[0]) {
      case "required":
        return this.i18nService.t("inputRequired");
      default:
        // Attempt to show a custom error message.
        if (this.error[1]?.message) {
          return this.error[1]?.message;
        }

        return this.error;
    }
  }
}
