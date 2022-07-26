import { UntypedFormGroup, ValidationErrors } from "@angular/forms";

import {
  FormGroupControls,
  FormValidationErrorsService as FormValidationErrorsAbstraction,
  AllValidationErrors,
} from "../abstractions/formValidationErrors.service";

export class FormValidationErrorsService implements FormValidationErrorsAbstraction {
  getFormValidationErrors(controls: FormGroupControls): AllValidationErrors[] {
    let errors: AllValidationErrors[] = [];
    Object.keys(controls).forEach((key) => {
      const control = controls[key];
      if (control instanceof UntypedFormGroup) {
        errors = errors.concat(this.getFormValidationErrors(control.controls));
      }

      const controlErrors: ValidationErrors = controls[key].errors;
      if (controlErrors !== null) {
        Object.keys(controlErrors).forEach((keyError) => {
          errors.push({
            controlName: key,
            errorName: keyError,
          });
        });
      }
    });

    return errors;
  }
}
