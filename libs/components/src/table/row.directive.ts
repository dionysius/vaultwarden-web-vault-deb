import { HostBinding, Directive } from "@angular/core";

@Directive({
  selector: "tr[bitRow]",
})
export class RowDirective {
  @HostBinding("class") get classList() {
    return [
      "tw-border-0",
      "tw-border-b",
      "tw-border-secondary-300",
      "tw-border-solid",
      "hover:tw-bg-background-alt",
      "last:tw-border-0",
    ];
  }
}
