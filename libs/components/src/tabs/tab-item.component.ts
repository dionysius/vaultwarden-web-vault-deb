import { Component, Input } from "@angular/core";

@Component({
  selector: "bit-tab-item",
  templateUrl: "./tab-item.component.html",
})
export class TabItemComponent {
  @Input() route: string; // ['/route']
  @Input() disabled = false;

  get baseClassList(): string[] {
    return [
      "tw-block",
      "tw-relative",
      "tw-py-2",
      "tw-px-4",
      "tw-font-semibold",
      "tw-transition",
      "tw-rounded-t",
      "tw-border-0",
      "tw-border-x",
      "tw-border-t-4",
      "tw-border-transparent",
      "tw-border-solid",
      "!tw-text-main",
      "hover:tw-underline",
      "hover:!tw-text-main",
      "focus-visible:tw-z-10",
      "focus-visible:tw-outline-none",
      "focus-visible:tw-ring-2",
      "focus-visible:tw-ring-primary-700",
      "disabled:tw-bg-secondary-100",
      "disabled:!tw-text-muted",
      "disabled:tw-no-underline",
      "disabled:tw-cursor-not-allowed",
    ];
  }

  get activeClassList(): string {
    return [
      "tw--mb-px",
      "tw-border-x-secondary-300",
      "tw-border-t-primary-500",
      "tw-border-b",
      "tw-border-b-background",
      "tw-bg-background",
      "!tw-text-primary-500",
      "hover:tw-border-t-primary-700",
      "hover:!tw-text-primary-700",
      "focus-visible:tw-border-t-primary-700",
      "focus-visible:!tw-text-primary-700",
    ].join(" ");
  }
}
