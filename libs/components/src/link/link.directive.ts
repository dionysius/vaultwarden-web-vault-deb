import { Input, HostBinding, Directive } from "@angular/core";

export type LinkType = "primary" | "secondary" | "contrast";

const linkStyles: Record<LinkType, string[]> = {
  primary: [
    "!tw-text-primary-500",
    "hover:!tw-text-primary-500",
    "focus-visible:tw-ring-primary-700",
    "disabled:!tw-text-primary-500/60",
  ],
  secondary: [
    "!tw-text-main",
    "hover:!tw-text-main",
    "focus-visible:tw-ring-primary-700",
    "disabled:!tw-text-muted/60",
  ],
  contrast: [
    "!tw-text-contrast",
    "hover:!tw-text-contrast",
    "focus-visible:tw-ring-text-contrast",
    "disabled:!tw-text-contrast/60",
  ],
};

@Directive({
  selector: "button[bitLink], a[bitLink]",
})
export class LinkDirective {
  @HostBinding("class") get classList() {
    return [
      "tw-font-semibold",
      "tw-py-0.5",
      "tw-px-0",
      "tw-bg-transparent",
      "tw-border-0",
      "tw-border-none",
      "tw-rounded",
      "tw-transition",
      "hover:tw-underline",
      "hover:tw-decoration-1",
      "focus-visible:tw-outline-none",
      "focus-visible:tw-underline",
      "focus-visible:tw-decoration-1",
      "focus-visible:tw-ring-2",
      "focus-visible:tw-z-10",
      "disabled:tw-no-underline",
      "disabled:tw-cursor-not-allowed",
    ].concat(linkStyles[this.linkType] ?? []);
  }

  @Input()
  linkType: LinkType = "primary";
}
