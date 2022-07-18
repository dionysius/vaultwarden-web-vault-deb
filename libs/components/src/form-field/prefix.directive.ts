import { Directive, HostBinding, Input } from "@angular/core";

export const PrefixClasses = [
  "tw-block",
  "tw-px-3",
  "tw-py-1.5",
  "tw-bg-background-alt",
  "tw-border",
  "tw-border-solid",
  "tw-border-secondary-500",
  "tw-text-muted",
  "tw-rounded-none",
  "disabled:!tw-text-muted",
  "disabled:tw-border-secondary-500",
];

@Directive({
  selector: "[bitPrefix]",
})
export class BitPrefixDirective {
  @HostBinding("class") @Input() get classList() {
    return PrefixClasses.concat(["tw-border-r-0", "first:tw-rounded-l"]);
  }
}
