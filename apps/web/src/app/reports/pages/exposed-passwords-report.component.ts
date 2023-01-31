import { Component, OnInit } from "@angular/core";

import { ModalService } from "@bitwarden/angular/services/modal.service";
import { AuditService } from "@bitwarden/common/abstractions/audit.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { PasswordRepromptService } from "@bitwarden/common/vault/abstractions/password-reprompt.service";
import { CipherType } from "@bitwarden/common/vault/enums/cipher-type";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";

import { CipherReportComponent } from "./cipher-report.component";

@Component({
  selector: "app-exposed-passwords-report",
  templateUrl: "exposed-passwords-report.component.html",
})
export class ExposedPasswordsReportComponent extends CipherReportComponent implements OnInit {
  exposedPasswordMap = new Map<string, number>();

  constructor(
    protected cipherService: CipherService,
    protected auditService: AuditService,
    modalService: ModalService,
    messagingService: MessagingService,
    passwordRepromptService: PasswordRepromptService
  ) {
    super(modalService, messagingService, true, passwordRepromptService);
  }

  ngOnInit() {
    this.checkAccess();
  }

  async load() {
    if (await this.checkAccess()) {
      super.load();
    }
  }

  async setCiphers() {
    const allCiphers = await this.getAllCiphers();
    const exposedPasswordCiphers: CipherView[] = [];
    const promises: Promise<void>[] = [];
    allCiphers.forEach((c) => {
      if (
        c.type !== CipherType.Login ||
        c.login.password == null ||
        c.login.password === "" ||
        c.isDeleted
      ) {
        return;
      }
      const promise = this.auditService.passwordLeaked(c.login.password).then((exposedCount) => {
        if (exposedCount > 0) {
          exposedPasswordCiphers.push(c);
          this.exposedPasswordMap.set(c.id, exposedCount);
        }
      });
      promises.push(promise);
    });
    await Promise.all(promises);
    this.ciphers = exposedPasswordCiphers;
  }

  protected getAllCiphers(): Promise<CipherView[]> {
    return this.cipherService.getAllDecrypted();
  }

  protected canManageCipher(c: CipherView): boolean {
    // this will only ever be false from the org view;
    return true;
  }
}
