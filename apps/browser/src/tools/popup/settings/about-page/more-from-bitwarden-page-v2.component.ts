import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { Observable, firstValueFrom } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { BillingAccountProfileStateService } from "@bitwarden/common/billing/abstractions/account/billing-account-profile-state.service";
import { EnvironmentService } from "@bitwarden/common/platform/abstractions/environment.service";
import { DialogService, ItemModule } from "@bitwarden/components";

import { BrowserApi } from "../../../../platform/browser/browser-api";
import { PopOutComponent } from "../../../../platform/popup/components/pop-out.component";
import { PopupHeaderComponent } from "../../../../platform/popup/layout/popup-header.component";
import { PopupPageComponent } from "../../../../platform/popup/layout/popup-page.component";

@Component({
  templateUrl: "more-from-bitwarden-page-v2.component.html",
  standalone: true,
  imports: [
    CommonModule,
    JslibModule,
    RouterModule,
    PopupPageComponent,
    PopupHeaderComponent,
    PopOutComponent,
    ItemModule,
  ],
})
export class MoreFromBitwardenPageV2Component {
  canAccessPremium$: Observable<boolean>;

  constructor(
    private dialogService: DialogService,
    billingAccountProfileStateService: BillingAccountProfileStateService,
    private environmentService: EnvironmentService,
  ) {
    this.canAccessPremium$ = billingAccountProfileStateService.hasPremiumFromAnySource$;
  }

  async openFreeBitwardenFamiliesPage() {
    const confirmed = await this.dialogService.openSimpleDialog({
      title: { key: "continueToWebApp" },
      content: { key: "freeBitwardenFamiliesPageDesc" },
      type: "info",
      acceptButtonText: { key: "continue" },
    });
    if (confirmed) {
      const env = await firstValueFrom(this.environmentService.environment$);
      const url = env.getWebVaultUrl();
      await BrowserApi.createNewTab(url + "/#/settings/sponsored-families");
    }
  }

  async openBitwardenForBusinessPage() {
    const confirmed = await this.dialogService.openSimpleDialog({
      title: { key: "continueToBitwardenDotCom" },
      content: { key: "bitwardenForBusinessPageDesc" },
      type: "info",
      acceptButtonText: { key: "continue" },
    });
    if (confirmed) {
      await BrowserApi.createNewTab("https://bitwarden.com/products/business/");
    }
  }

  async openAuthenticatorPage() {
    const confirmed = await this.dialogService.openSimpleDialog({
      title: { key: "continueToBitwardenDotCom" },
      content: { key: "continueToAuthenticatorPageDesc" },
      type: "info",
      acceptButtonText: { key: "continue" },
    });
    if (confirmed) {
      await BrowserApi.createNewTab("https://bitwarden.com/products/authenticator");
    }
  }

  async openSecretsManagerPage() {
    const confirmed = await this.dialogService.openSimpleDialog({
      title: { key: "continueToBitwardenDotCom" },
      content: { key: "continueToSecretsManagerPageDesc" },
      type: "info",
      acceptButtonText: { key: "continue" },
    });
    if (confirmed) {
      await BrowserApi.createNewTab("https://bitwarden.com/products/secrets-manager");
    }
  }

  async openPasswordlessDotDevPage() {
    const confirmed = await this.dialogService.openSimpleDialog({
      title: { key: "continueToBitwardenDotCom" },
      content: { key: "continueToPasswordlessDotDevPageDesc" },
      type: "info",
      acceptButtonText: { key: "continue" },
    });
    if (confirmed) {
      await BrowserApi.createNewTab("https://bitwarden.com/products/passwordless");
    }
  }
}
