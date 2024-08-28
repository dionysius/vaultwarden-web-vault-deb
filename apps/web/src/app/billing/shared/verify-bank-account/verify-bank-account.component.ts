import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";

import { VerifyBankAccountRequest } from "@bitwarden/common/billing/models/request/verify-bank-account.request";

import { SharedModule } from "../../../shared";

@Component({
  selector: "app-verify-bank-account",
  templateUrl: "./verify-bank-account.component.html",
  standalone: true,
  imports: [SharedModule],
})
export class VerifyBankAccountComponent {
  @Input() onSubmit?: (request: VerifyBankAccountRequest) => Promise<void>;
  @Output() submitted = new EventEmitter();

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
    const request = new VerifyBankAccountRequest(
      this.formGroup.value.amount1,
      this.formGroup.value.amount2,
    );
    await this.onSubmit(request);
    this.submitted.emit();
  };
}
