import { CommonModule } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Router } from "@angular/router";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { BillingAccountProfileStateService } from "@bitwarden/common/billing/abstractions";
import { ProductTierType } from "@bitwarden/common/billing/enums";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { CipherId } from "@bitwarden/common/types/guid";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import {
  BadgeModule,
  CardComponent,
  ItemModule,
  ToastService,
  TypographyModule,
} from "@bitwarden/components";

import BrowserPopupUtils from "../../../../../../platform/popup/browser-popup-utils";

@Component({
  standalone: true,
  selector: "app-open-attachments",
  templateUrl: "./open-attachments.component.html",
  imports: [BadgeModule, CommonModule, ItemModule, JslibModule, TypographyModule, CardComponent],
})
export class OpenAttachmentsComponent implements OnInit {
  /** Cipher `id` */
  @Input({ required: true }) cipherId: CipherId;

  /** True when the attachments window should be opened in a popout */
  openAttachmentsInPopout = BrowserPopupUtils.inPopup(window);

  /** True when the user has access to premium or h  */
  canAccessAttachments: boolean;

  /** True when the cipher is a part of a free organization */
  cipherIsAPartOfFreeOrg: boolean;

  constructor(
    private router: Router,
    private billingAccountProfileStateService: BillingAccountProfileStateService,
    private cipherService: CipherService,
    private organizationService: OrganizationService,
    private toastService: ToastService,
    private i18nService: I18nService,
  ) {
    this.billingAccountProfileStateService.hasPremiumFromAnySource$
      .pipe(takeUntilDestroyed())
      .subscribe((canAccessPremium) => {
        this.canAccessAttachments = canAccessPremium;
      });
  }

  async ngOnInit(): Promise<void> {
    const cipherDomain = await this.cipherService.get(this.cipherId);
    const cipher = await cipherDomain.decrypt(
      await this.cipherService.getKeyForCipherKeyDecryption(cipherDomain),
    );

    if (!cipher.organizationId) {
      this.cipherIsAPartOfFreeOrg = false;
      return;
    }

    const org = await this.organizationService.get(cipher.organizationId);

    this.cipherIsAPartOfFreeOrg = org.productTierType === ProductTierType.Free;
  }

  /** Routes the user to the attachments screen, if available */
  async openAttachments() {
    if (!this.canAccessAttachments) {
      await this.router.navigate(["/premium"]);
      return;
    }

    if (this.cipherIsAPartOfFreeOrg) {
      this.toastService.showToast({
        variant: "error",
        title: null,
        message: this.i18nService.t("freeOrgsCannotUseAttachments"),
      });
      return;
    }

    if (this.openAttachmentsInPopout) {
      const destinationUrl = this.router
        .createUrlTree(["/attachments"], { queryParams: { cipherId: this.cipherId } })
        .toString();

      const currentBaseUrl = window.location.href.replace(this.router.url, "");

      await BrowserPopupUtils.openCurrentPagePopout(window, currentBaseUrl + destinationUrl);
    } else {
      await this.router.navigate(["/attachments"], { queryParams: { cipherId: this.cipherId } });
    }
  }
}
