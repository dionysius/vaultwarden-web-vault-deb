import { Input, HostBinding, Directive } from "@angular/core";

export type ButtonTypes = "primary" | "secondary" | "danger";

const buttonStyles: Record<ButtonTypes, string[]> = {
  primary: [
    "tw-border-primary-500",
    "tw-bg-primary-500",
    "!tw-text-contrast",
    "hover:tw-bg-primary-700",
    "hover:tw-border-primary-700",
    "disabled:tw-bg-primary-500/60",
    "disabled:tw-border-primary-500/60",
    "disabled:!tw-text-contrast/60",
    "disabled:tw-bg-clip-padding",
  ],
  secondary: [
    "tw-bg-transparent",
    "tw-border-text-muted",
    "!tw-text-muted",
    "hover:tw-bg-secondary-500",
    "hover:tw-border-secondary-500",
    "hover:!tw-text-contrast",
    "disabled:tw-bg-transparent",
    "disabled:tw-border-text-muted/60",
    "disabled:!tw-text-muted/60",
  ],
  danger: [
    "tw-bg-transparent",
    "tw-border-danger-500",
    "!tw-text-danger",
    "hover:tw-bg-danger-500",
    "hover:tw-border-danger-500",
    "hover:!tw-text-contrast",
    "disabled:tw-bg-transparent",
    "disabled:tw-border-danger-500/60",
    "disabled:!tw-text-danger/60",
  ],
};

@Directive({
  selector: "button[bitButton], a[bitButton]",
})
export class ButtonDirective {
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
      "hover:tw-no-underline",
      "focus:tw-outline-none",
      "focus-visible:tw-ring",
      "focus-visible:tw-ring-offset-2",
      "focus-visible:tw-ring-primary-700",
      "focus-visible:tw-z-10",
    ]
      .concat(this.block ? ["tw-w-full", "tw-block"] : ["tw-inline-block"])
      .concat(buttonStyles[this.buttonType ?? "secondary"]);
  }

  @Input()
  buttonType: ButtonTypes = null;

  @Input()
  block = false;
}
