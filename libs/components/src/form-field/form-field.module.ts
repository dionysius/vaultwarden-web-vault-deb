import { NgModule } from "@angular/core";

import { FormControlModule } from "../form-control";
import { BitInputDirective } from "../input/input.directive";
import { InputModule } from "../input/input.module";
import { MultiSelectComponent } from "../multi-select/multi-select.component";
import { MultiSelectModule } from "../multi-select/multi-select.module";
import { SharedModule } from "../shared";

import { BitErrorSummary } from "./error-summary.component";
import { BitErrorComponent } from "./error.component";
import { BitFormFieldComponent } from "./form-field.component";
import { BitPasswordInputToggleDirective } from "./password-input-toggle.directive";
import { BitPrefixDirective } from "./prefix.directive";
import { BitSuffixDirective } from "./suffix.directive";

@NgModule({
  imports: [SharedModule, FormControlModule, InputModule, MultiSelectModule],
  declarations: [
    BitErrorComponent,
    BitErrorSummary,
    BitFormFieldComponent,
    BitPasswordInputToggleDirective,
    BitPrefixDirective,
    BitSuffixDirective,
  ],
  exports: [
    BitErrorComponent,
    BitErrorSummary,
    BitFormFieldComponent,
    BitInputDirective,
    BitPasswordInputToggleDirective,
    BitPrefixDirective,
    BitSuffixDirective,
    MultiSelectComponent,
    FormControlModule,
  ],
})
export class FormFieldModule {}
