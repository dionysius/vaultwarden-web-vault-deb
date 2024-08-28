import { NgModule } from "@angular/core";

import { HeaderModule } from "../../layouts/header/header.module";
import { SharedModule } from "../../shared";

import { AddCreditDialogComponent } from "./add-credit-dialog.component";
import { AdjustPaymentDialogV2Component } from "./adjust-payment-dialog/adjust-payment-dialog-v2.component";
import { AdjustPaymentDialogComponent } from "./adjust-payment-dialog/adjust-payment-dialog.component";
import { AdjustStorageComponent } from "./adjust-storage.component";
import { BillingHistoryComponent } from "./billing-history.component";
import { OffboardingSurveyComponent } from "./offboarding-survey.component";
import { PaymentV2Component } from "./payment/payment-v2.component";
import { PaymentComponent } from "./payment/payment.component";
import { PaymentMethodComponent } from "./payment-method.component";
import { SecretsManagerSubscribeComponent } from "./sm-subscribe.component";
import { TaxInfoComponent } from "./tax-info.component";
import { UpdateLicenseDialogComponent } from "./update-license-dialog.component";
import { UpdateLicenseComponent } from "./update-license.component";
import { VerifyBankAccountComponent } from "./verify-bank-account/verify-bank-account.component";

@NgModule({
  imports: [
    SharedModule,
    PaymentComponent,
    TaxInfoComponent,
    HeaderModule,
    PaymentV2Component,
    VerifyBankAccountComponent,
  ],
  declarations: [
    AddCreditDialogComponent,
    AdjustPaymentDialogComponent,
    AdjustStorageComponent,
    BillingHistoryComponent,
    PaymentMethodComponent,
    SecretsManagerSubscribeComponent,
    UpdateLicenseComponent,
    UpdateLicenseDialogComponent,
    OffboardingSurveyComponent,
    AdjustPaymentDialogV2Component,
  ],
  exports: [
    SharedModule,
    PaymentComponent,
    TaxInfoComponent,
    AdjustStorageComponent,
    BillingHistoryComponent,
    SecretsManagerSubscribeComponent,
    UpdateLicenseComponent,
    UpdateLicenseDialogComponent,
    OffboardingSurveyComponent,
    VerifyBankAccountComponent,
  ],
})
export class BillingSharedModule {}
