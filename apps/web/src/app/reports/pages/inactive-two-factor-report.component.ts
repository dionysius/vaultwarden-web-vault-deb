import { Component, OnInit } from "@angular/core";

import { ModalService } from "@bitwarden/angular/services/modal.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { Utils } from "@bitwarden/common/misc/utils";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { PasswordRepromptService } from "@bitwarden/common/vault/abstractions/password-reprompt.service";
import { CipherType } from "@bitwarden/common/vault/enums/cipher-type";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";

import { CipherReportComponent } from "./cipher-report.component";

@Component({
  selector: "app-inactive-two-factor-report",
  templateUrl: "inactive-two-factor-report.component.html",
})
export class InactiveTwoFactorReportComponent extends CipherReportComponent implements OnInit {
  services = new Map<string, string>();
  cipherDocs = new Map<string, string>();

  constructor(
    protected cipherService: CipherService,
    modalService: ModalService,
    messagingService: MessagingService,
    private logService: LogService,
    passwordRepromptService: PasswordRepromptService
  ) {
    super(modalService, messagingService, true, passwordRepromptService);
  }

  async ngOnInit() {
    if (await this.checkAccess()) {
      await super.load();
    }
  }

  async setCiphers() {
    try {
      await this.load2fa();
    } catch (e) {
      this.logService.error(e);
    }

    if (this.services.size > 0) {
      const allCiphers = await this.getAllCiphers();
      const inactive2faCiphers: CipherView[] = [];
      const promises: Promise<void>[] = [];
      const docs = new Map<string, string>();
      allCiphers.forEach((c) => {
        if (
          c.type !== CipherType.Login ||
          (c.login.totp != null && c.login.totp !== "") ||
          !c.login.hasUris ||
          c.isDeleted
        ) {
          return;
        }
        for (let i = 0; i < c.login.uris.length; i++) {
          const u = c.login.uris[i];
          if (u.uri != null && u.uri !== "") {
            const uri = u.uri.replace("www.", "");
            const domain = Utils.getDomain(uri);
            if (domain != null && this.services.has(domain)) {
              if (this.services.get(domain) != null) {
                docs.set(c.id, this.services.get(domain));
              }
              inactive2faCiphers.push(c);
            }
          }
        }
      });
      await Promise.all(promises);
      this.ciphers = inactive2faCiphers;
      this.cipherDocs = docs;
    }
  }

  protected getAllCiphers(): Promise<CipherView[]> {
    return this.cipherService.getAllDecrypted();
  }

  private async load2fa() {
    if (this.services.size > 0) {
      return;
    }
    const response = await fetch(new Request("https://api.2fa.directory/v3/totp.json"));
    if (response.status !== 200) {
      throw new Error();
    }
    const responseJson = await response.json();
    for (const service of responseJson) {
      const serviceData = service[1];
      if (serviceData.domain == null) {
        continue;
      }
      if (serviceData.documentation == null) {
        continue;
      }
      if (serviceData["additional-domains"] != null) {
        for (const additionalDomain of serviceData["additional-domains"]) {
          this.services.set(additionalDomain, serviceData.documentation);
        }
      }
      this.services.set(serviceData.domain, serviceData.documentation);
    }
  }
}
