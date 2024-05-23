import { coerceBooleanProperty } from "@angular/cdk/coercion";
import { Input, HostBinding, Component } from "@angular/core";

import { ButtonLikeAbstraction, ButtonType } from "../shared/button-like.abstraction";

const focusRing = [
  "focus-visible:tw-ring",
  "focus-visible:tw-ring-offset-2",
  "focus-visible:tw-ring-primary-700",
  "focus-visible:tw-z-10",
];

const buttonStyles: Record<ButtonType, string[]> = {
  primary: [
    "tw-border-primary-600",
    "tw-bg-primary-600",
    "!tw-text-contrast",
    "hover:tw-bg-primary-700",
    "hover:tw-border-primary-700",
    "disabled:tw-bg-primary-600/60",
    "disabled:tw-border-primary-600/60",
    "disabled:!tw-text-contrast/60",
    "disabled:tw-bg-clip-padding",
    "disabled:tw-cursor-not-allowed",
    ...focusRing,
  ],
  secondary: [
    "tw-bg-transparent",
    "tw-border-text-muted",
    "!tw-text-muted",
    "hover:tw-bg-text-muted",
    "hover:tw-border-text-muted",
    "hover:!tw-text-contrast",
    "disabled:tw-bg-transparent",
    "disabled:tw-border-text-muted/60",
    "disabled:!tw-text-muted/60",
    "disabled:tw-cursor-not-allowed",
    ...focusRing,
  ],
  danger: [
    "tw-bg-transparent",
    "tw-border-danger-600",
    "!tw-text-danger",
    "hover:tw-bg-danger-600",
    "hover:tw-border-danger-600",
    "hover:!tw-text-contrast",
    "disabled:tw-bg-transparent",
    "disabled:tw-border-danger-600/60",
    "disabled:!tw-text-danger/60",
    "disabled:tw-cursor-not-allowed",
    ...focusRing,
  ],
  unstyled: [],
};

@Component({
  selector: "button[bitButton], a[bitButton]",
  templateUrl: "button.component.html",
  providers: [{ provide: ButtonLikeAbstraction, useExisting: ButtonComponent }],
})
export class ButtonComponent implements ButtonLikeAbstraction {
  @HostBinding("class") get classList() {
    return [
      "tw-font-semibold",
      "tw-py-1.5",
      "tw-px-3",
      "tw-rounded",
      "tw-transition",
      "tw-border",
      "tw-border-solid",
      "tw-text-center",
      "tw-no-underline",
      "hover:tw-no-underline",
      "focus:tw-outline-none",
    ]
      .concat(this.block ? ["tw-w-full", "tw-block"] : ["tw-inline-block"])
      .concat(buttonStyles[this.buttonType ?? "secondary"]);
  }

  @HostBinding("attr.disabled")
  get disabledAttr() {
    const disabled = this.disabled != null && this.disabled !== false;
    return disabled || this.loading ? true : null;
  }

  @Input() buttonType: ButtonType;

  private _block = false;

  @Input()
  get block(): boolean {
    return this._block;
  }

  set block(value: boolean | "") {
    this._block = coerceBooleanProperty(value);
  }

  @Input() loading = false;

  @Input() disabled = false;

  setButtonType(value: "primary" | "secondary" | "danger" | "unstyled") {
    this.buttonType = value;
  }
}
