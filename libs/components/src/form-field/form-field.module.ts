import { NgModule } from "@angular/core";

import { BitInputDirective } from "../input/input.directive";
import { InputModule } from "../input/input.module";
import { MultiSelectComponent } from "../multi-select/multi-select.component";
import { MultiSelectModule } from "../multi-select/multi-select.module";
import { SharedModule } from "../shared";

import { BitErrorSummary } from "./error-summary.component";
import { BitErrorComponent } from "./error.component";
import { BitFormFieldComponent } from "./form-field.component";
import { BitHintComponent } from "./hint.component";
import { BitLabel } from "./label.directive";
import { BitPasswordInputToggleDirective } from "./password-input-toggle.directive";
import { BitPrefixDirective } from "./prefix.directive";
import { BitSuffixDirective } from "./suffix.directive";

@NgModule({
  imports: [SharedModule, InputModule, MultiSelectModule],
  declarations: [
    BitErrorComponent,
    BitErrorSummary,
    BitFormFieldComponent,
    BitHintComponent,
    BitLabel,
    BitPasswordInputToggleDirective,
    BitPrefixDirective,
    BitSuffixDirective,
  ],
  exports: [
    BitErrorComponent,
    BitErrorSummary,
    BitFormFieldComponent,
    BitHintComponent,
    BitInputDirective,
    BitLabel,
    BitPasswordInputToggleDirective,
    BitPrefixDirective,
    BitSuffixDirective,
    MultiSelectComponent,
  ],
})
export class FormFieldModule {}
