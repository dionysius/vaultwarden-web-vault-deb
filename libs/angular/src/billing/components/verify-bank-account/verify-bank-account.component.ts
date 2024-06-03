import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";

@Component({
  selector: "app-verify-bank-account",
  templateUrl: "./verify-bank-account.component.html",
})
export class VerifyBankAccountComponent {
  @Input() onSubmit?: (amount1: number, amount2: number) => Promise<void>;
  @Output() verificationSubmitted = new EventEmitter();

  protected formGroup = this.formBuilder.group({
    amount1: new FormControl<number>(null, [
      Validators.required,
      Validators.min(0),
      Validators.max(99),
    ]),
    amount2: new FormControl<number>(null, [
      Validators.required,
      Validators.min(0),
      Validators.max(99),
    ]),
  });

  constructor(private formBuilder: FormBuilder) {}

  submit = async () => {
    if (this.onSubmit) {
      await this.onSubmit(this.formGroup.value.amount1, this.formGroup.value.amount2);
    }
    this.verificationSubmitted.emit();
  };
}
