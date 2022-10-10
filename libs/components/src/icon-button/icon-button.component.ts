import { Component, HostBinding, Input } from "@angular/core";

import { ButtonLikeAbstraction } from "../shared/button-like.abstraction";

export type IconButtonType = "contrast" | "main" | "muted" | "primary" | "secondary" | "danger";

const styles: Record<IconButtonType, string[]> = {
  contrast: [
    "tw-bg-transparent",
    "!tw-text-contrast",
    "tw-border-transparent",
    "hover:tw-bg-transparent-hover",
    "hover:tw-border-text-contrast",
    "focus-visible:before:tw-ring-text-contrast",
    "disabled:hover:tw-border-transparent",
    "disabled:hover:tw-bg-transparent",
  ],
  main: [
    "tw-bg-transparent",
    "!tw-text-main",
    "tw-border-transparent",
    "hover:tw-bg-transparent-hover",
    "hover:tw-border-text-main",
    "focus-visible:before:tw-ring-text-main",
    "disabled:hover:tw-border-transparent",
    "disabled:hover:tw-bg-transparent",
  ],
  muted: [
    "tw-bg-transparent",
    "!tw-text-muted",
    "tw-border-transparent",
    "hover:tw-bg-transparent-hover",
    "hover:tw-border-primary-700",
    "focus-visible:before:tw-ring-primary-700",
    "disabled:hover:tw-border-transparent",
    "disabled:hover:tw-bg-transparent",
  ],
  primary: [
    "tw-bg-primary-500",
    "!tw-text-contrast",
    "tw-border-primary-500",
    "hover:tw-bg-primary-700",
    "hover:tw-border-primary-700",
    "focus-visible:before:tw-ring-primary-700",
    "disabled:hover:tw-border-primary-500",
    "disabled:hover:tw-bg-primary-500",
  ],
  secondary: [
    "tw-bg-transparent",
    "!tw-text-muted",
    "tw-border-text-muted",
    "hover:!tw-text-contrast",
    "hover:tw-bg-text-muted",
    "focus-visible:before:tw-ring-primary-700",
    "disabled:hover:tw-border-text-muted",
    "disabled:hover:tw-bg-transparent",
    "disabled:hover:!tw-text-muted",
    "disabled:hover:tw-border-text-muted",
  ],
  danger: [
    "tw-bg-transparent",
    "!tw-text-danger",
    "tw-border-danger-500",
    "hover:!tw-text-contrast",
    "hover:tw-bg-danger-500",
    "focus-visible:before:tw-ring-primary-700",
    "disabled:hover:tw-border-danger-500",
    "disabled:hover:tw-bg-transparent",
    "disabled:hover:!tw-text-danger",
    "disabled:hover:tw-border-danger-500",
  ],
};

export type IconButtonSize = "default" | "small";

const sizes: Record<IconButtonSize, string[]> = {
  default: ["tw-px-2.5", "tw-py-1.5"],
  small: ["tw-leading-none", "tw-text-base", "tw-p-1"],
};

@Component({
  selector: "button[bitIconButton]",
  templateUrl: "icon-button.component.html",
  providers: [{ provide: ButtonLikeAbstraction, useExisting: BitIconButtonComponent }],
})
export class BitIconButtonComponent implements ButtonLikeAbstraction {
  @Input("bitIconButton") icon: string;

  @Input() buttonType: IconButtonType = "main";

  @Input() size: IconButtonSize = "default";

  @HostBinding("class") get classList() {
    return [
      "tw-font-semibold",
      "tw-border",
      "tw-border-solid",
      "tw-rounded",
      "tw-transition",
      "hover:tw-no-underline",
      "disabled:tw-opacity-60",
      "focus:tw-outline-none",

      // Workaround for box-shadow with transparent offset issue:
      // https://github.com/tailwindlabs/tailwindcss/issues/3595
      // Remove `before:` and use regular `tw-ring` when browser no longer has bug, or better:
      // switch to `outline` with `outline-offset` when Safari supports border radius on outline.
      // Using `box-shadow` to create outlines is a hack and as such `outline` should be preferred.
      "tw-relative",
      "before:tw-content-['']",
      "before:tw-block",
      "before:tw-absolute",
      "before:-tw-inset-[3px]",
      "before:tw-rounded-md",
      "before:tw-transition",
      "before:tw-ring",
      "before:tw-ring-transparent",
      "focus-visible:before:tw-ring-text-contrast",
      "focus-visible:tw-z-10",
    ]
      .concat(styles[this.buttonType])
      .concat(sizes[this.size]);
  }

  get iconClass() {
    return [this.icon, "!tw-m-0"];
  }

  @HostBinding("attr.disabled")
  get disabledAttr() {
    const disabled = this.disabled != null && this.disabled !== false;
    return disabled || this.loading ? true : null;
  }

  @Input() loading = false;
  @Input() disabled = false;
}
