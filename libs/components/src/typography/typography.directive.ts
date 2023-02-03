import { Directive, HostBinding, Input } from "@angular/core";

type TypographyType = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "body1" | "body2" | "helper";

const styles: Record<TypographyType, string[]> = {
  h1: ["tw-text-3xl", "tw-font-semibold", "tw-mb-2"],
  h2: ["tw-text-2xl", "tw-font-semibold", "tw-mb-2"],
  h3: ["tw-text-xl", "tw-font-semibold", "tw-mb-2"],
  h4: ["tw-text-lg", "tw-font-semibold", "tw-mb-2"],
  h5: ["tw-text-base", "tw-font-semibold", "tw-mb-2"],
  h6: ["tw-text-sm", "tw-font-semibold", "tw-mb-2"],
  body1: ["tw-text-base"],
  body2: ["tw-text-sm"],
  helper: ["tw-text-xs"],
};

@Directive({
  selector: "[bitTypography]",
})
export class TypographyDirective {
  @Input("bitTypography") bitTypography: TypographyType;

  @HostBinding("class") get classList() {
    return styles[this.bitTypography];
  }
}
