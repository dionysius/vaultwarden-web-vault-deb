import { AbstractControl, ValidatorFn } from "@angular/forms";

import { FormGroupControls } from "@bitwarden/common/abstractions/formValidationErrors.service";

//check to ensure two fields do not have the same value
export function validateInputsDoesntMatch(matchTo: string, errorMessage: string): ValidatorFn {
  return (control: AbstractControl) => {
    if (control.parent && control.parent.controls) {
      return control?.value === (control?.parent?.controls as FormGroupControls)[matchTo].value
        ? {
            inputsMatchError: {
              message: errorMessage,
            },
          }
        : null;
    }

    return null;
  };
}

//check to ensure two fields have the same value
export function validateInputsMatch(matchTo: string, errorMessage: string): ValidatorFn {
  return (control: AbstractControl) => {
    if (control.parent && control.parent.controls) {
      return control?.value === (control?.parent?.controls as FormGroupControls)[matchTo].value
        ? null
        : {
            inputsDoesntMatchError: {
              message: errorMessage,
            },
          };
    }

    return null;
  };
}
