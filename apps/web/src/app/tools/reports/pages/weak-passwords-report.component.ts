import { Component, OnInit } from "@angular/core";

import { ModalService } from "@bitwarden/angular/services/modal.service";
import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";
import { PasswordStrengthServiceAbstraction } from "@bitwarden/common/tools/password-strength";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { SyncService } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";
import { CipherType } from "@bitwarden/common/vault/enums";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import { BadgeVariant } from "@bitwarden/components";
import { PasswordRepromptService } from "@bitwarden/vault";

import { CipherReportComponent } from "./cipher-report.component";

@Component({
  selector: "app-weak-passwords-report",
  templateUrl: "weak-passwords-report.component.html",
})
export class WeakPasswordsReportComponent extends CipherReportComponent implements OnInit {
  passwordStrengthMap = new Map<string, [string, BadgeVariant]>();
  disabled = true;

  private passwordStrengthCache = new Map<string, number>();
  weakPasswordCiphers: CipherView[] = [];

  constructor(
    protected cipherService: CipherService,
    protected passwordStrengthService: PasswordStrengthServiceAbstraction,
    protected organizationService: OrganizationService,
    modalService: ModalService,
    passwordRepromptService: PasswordRepromptService,
    i18nService: I18nService,
    syncService: SyncService,
  ) {
    super(
      cipherService,
      modalService,
      passwordRepromptService,
      organizationService,
      i18nService,
      syncService,
    );
  }

  async ngOnInit() {
    await super.load();
  }

  async setCiphers() {
    const allCiphers: any = await this.getAllCiphers();
    this.passwordStrengthCache = new Map<string, number>();
    this.weakPasswordCiphers = [];
    this.filterStatus = [0];
    this.findWeakPasswords(allCiphers);
  }

  protected findWeakPasswords(ciphers: any[]): void {
    ciphers.forEach((ciph) => {
      const { type, login, isDeleted, edit, viewPassword, id } = ciph;
      if (
        type !== CipherType.Login ||
        login.password == null ||
        login.password === "" ||
        isDeleted ||
        (!this.organization && !edit) ||
        !viewPassword
      ) {
        return;
      }

      const hasUserName = this.isUserNameNotEmpty(ciph);
      const cacheKey = this.getCacheKey(ciph);
      if (!this.passwordStrengthCache.has(cacheKey)) {
        let userInput: string[] = [];
        if (hasUserName) {
          const atPosition = login.username.indexOf("@");
          if (atPosition > -1) {
            userInput = userInput
              .concat(
                login.username
                  .substr(0, atPosition)
                  .trim()
                  .toLowerCase()
                  .split(/[^A-Za-z0-9]/),
              )
              .filter((i) => i.length >= 3);
          } else {
            userInput = login.username
              .trim()
              .toLowerCase()
              .split(/[^A-Za-z0-9]/)
              .filter((i: any) => i.length >= 3);
          }
        }
        const result = this.passwordStrengthService.getPasswordStrength(
          login.password,
          null,
          userInput.length > 0 ? userInput : null,
        );
        this.passwordStrengthCache.set(cacheKey, result.score);
      }
      const score = this.passwordStrengthCache.get(cacheKey);

      if (score != null && score <= 2) {
        this.passwordStrengthMap.set(id, this.scoreKey(score));
        this.weakPasswordCiphers.push(ciph);
      }
    });
    this.weakPasswordCiphers.sort((a, b) => {
      return (
        this.passwordStrengthCache.get(this.getCacheKey(a)) -
        this.passwordStrengthCache.get(this.getCacheKey(b))
      );
    });

    this.filterCiphersByOrg(this.weakPasswordCiphers);
  }

  protected canManageCipher(c: CipherView): boolean {
    // this will only ever be false from the org view;
    return true;
  }

  private isUserNameNotEmpty(c: CipherView): boolean {
    return !Utils.isNullOrWhitespace(c.login.username);
  }

  private getCacheKey(c: CipherView): string {
    return c.login.password + "_____" + (this.isUserNameNotEmpty(c) ? c.login.username : "");
  }

  private scoreKey(score: number): [string, BadgeVariant] {
    switch (score) {
      case 4:
        return ["strong", "success"];
      case 3:
        return ["good", "primary"];
      case 2:
        return ["weak", "warning"];
      default:
        return ["veryWeak", "danger"];
    }
  }
}
