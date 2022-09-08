import { NgModule } from "@angular/core";

import { BitInputDirective } from "../input/input.directive";
import { InputModule } from "../input/input.module";
import { SharedModule } from "../shared";

import { BitErrorSummary } from "./error-summary.component";
import { BitErrorComponent } from "./error.component";
import { BitFormFieldComponent } from "./form-field.component";
import { BitHintComponent } from "./hint.component";
import { BitLabel } from "./label.directive";
import { BitPrefixDirective } from "./prefix.directive";
import { BitSuffixDirective } from "./suffix.directive";

@NgModule({
  imports: [SharedModule, InputModule],
  exports: [
    BitErrorComponent,
    BitErrorSummary,
    BitFormFieldComponent,
    BitHintComponent,
    BitInputDirective,
    BitLabel,
    BitPrefixDirective,
    BitSuffixDirective,
  ],
  declarations: [
    BitErrorComponent,
    BitErrorSummary,
    BitFormFieldComponent,
    BitHintComponent,
    BitLabel,
    BitPrefixDirective,
    BitSuffixDirective,
  ],
})
export class FormFieldModule {}
