import { Location } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { first } from "rxjs/operators";

import { PasswordHistoryComponent as BasePasswordHistoryComponent } from "@bitwarden/angular/vault/components/password-history.component";
import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";

@Component({
  selector: "app-password-history",
  templateUrl: "password-history.component.html",
})
// eslint-disable-next-line rxjs-angular/prefer-takeuntil
export class PasswordHistoryComponent extends BasePasswordHistoryComponent implements OnInit {
  constructor(
    cipherService: CipherService,
    platformUtilsService: PlatformUtilsService,
    i18nService: I18nService,
    accountService: AccountService,
    private location: Location,
    private route: ActivatedRoute,
  ) {
    super(cipherService, platformUtilsService, i18nService, accountService, window);
  }

  async ngOnInit() {
    // eslint-disable-next-line rxjs-angular/prefer-takeuntil, rxjs/no-async-subscribe
    this.route.queryParams.pipe(first()).subscribe(async (params) => {
      if (params.cipherId) {
        this.cipherId = params.cipherId;
      } else {
        this.close();
      }
      await this.init();
    });
  }

  close() {
    this.location.back();
  }
}
