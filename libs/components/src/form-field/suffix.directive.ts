import { Directive, HostBinding, Input } from "@angular/core";

import { PrefixClasses } from "./prefix.directive";

@Directive({
  selector: "[bitSuffix]",
})
export class BitSuffixDirective {
  @HostBinding("class") @Input() get classList() {
    return PrefixClasses.concat(["tw-border-l-0", "last:tw-rounded-r"]);
  }
}
