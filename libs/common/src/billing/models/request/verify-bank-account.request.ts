export class VerifyBankAccountRequest {
  amount1: number;
  amount2: number;

  constructor(amount1: number, amount2: number) {
    this.amount1 = amount1;
    this.amount2 = amount2;
  }
}
