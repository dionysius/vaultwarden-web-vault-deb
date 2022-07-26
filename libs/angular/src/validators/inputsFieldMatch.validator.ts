import { AbstractControl, UntypedFormGroup, ValidatorFn } from "@angular/forms";

import { FormGroupControls } from "@bitwarden/common/abstractions/formValidationErrors.service";

export class InputsFieldMatch {
  //check to ensure two fields do not have the same value
  static validateInputsDoesntMatch(matchTo: string, errorMessage: string): ValidatorFn {
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
  static validateInputsMatch(matchTo: string, errorMessage: string): ValidatorFn {
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

  //checks the formGroup if two fields have the same value and validation is controlled from either field
  static validateFormInputsMatch(field: string, fieldMatchTo: string, errorMessage: string) {
    return (formGroup: UntypedFormGroup) => {
      const fieldCtrl = formGroup.controls[field];
      const fieldMatchToCtrl = formGroup.controls[fieldMatchTo];

      if (fieldCtrl.value !== fieldMatchToCtrl.value) {
        fieldMatchToCtrl.setErrors({
          inputsDoesntMatchError: {
            message: errorMessage,
          },
        });
      } else {
        fieldMatchToCtrl.setErrors(null);
      }
    };
  }
}
