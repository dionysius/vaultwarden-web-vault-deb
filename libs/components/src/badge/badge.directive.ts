import { Directive, ElementRef, HostBinding, Input } from "@angular/core";

export type BadgeVariant = "primary" | "secondary" | "success" | "danger" | "warning" | "info";

const styles: Record<BadgeVariant, string[]> = {
  primary: ["tw-bg-primary-500"],
  secondary: ["tw-bg-text-muted"],
  success: ["tw-bg-success-500"],
  danger: ["tw-bg-danger-500"],
  warning: ["tw-bg-warning-500"],
  info: ["tw-bg-info-500"],
};

const hoverStyles: Record<BadgeVariant, string[]> = {
  primary: ["hover:tw-bg-primary-700"],
  secondary: ["hover:tw-bg-secondary-700"],
  success: ["hover:tw-bg-success-700"],
  danger: ["hover:tw-bg-danger-700"],
  warning: ["hover:tw-bg-warning-700"],
  info: ["hover:tw-bg-info-700"],
};

@Directive({
  selector: "span[bitBadge], a[bitBadge], button[bitBadge]",
})
export class BadgeDirective {
  @HostBinding("class") get classList() {
    return [
      "tw-inline-block",
      "tw-py-0.5",
      "tw-px-1.5",
      "tw-font-bold",
      "tw-text-center",
      "tw-align-text-top",
      "!tw-text-contrast",
      "tw-rounded",
      "tw-border-none",
      "tw-box-border",
      "tw-whitespace-nowrap",
      "tw-text-xs",
      "hover:tw-no-underline",
      "focus:tw-outline-none",
      "focus:tw-ring",
      "focus:tw-ring-offset-2",
      "focus:tw-ring-primary-700",
    ]
      .concat(styles[this.variant])
      .concat(this.hasHoverEffects ? hoverStyles[this.variant] : [])
      .concat(this.truncate ? ["tw-truncate", "tw-max-w-40"] : []);
  }
  @HostBinding("attr.title") get title() {
    return this.truncate ? this.el.nativeElement.textContent.trim() : null;
  }

  /**
   * Variant, sets the background color of the badge.
   */
  @Input() variant: BadgeVariant = "primary";

  /**
   * Truncate long text
   */
  @Input() truncate = true;

  private hasHoverEffects = false;

  constructor(private el: ElementRef<HTMLElement>) {
    this.hasHoverEffects = el?.nativeElement?.nodeName != "SPAN";
  }
}
