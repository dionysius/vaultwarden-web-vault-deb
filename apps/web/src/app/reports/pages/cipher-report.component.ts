import { Directive, ViewChild, ViewContainerRef } from "@angular/core";

import { ModalService } from "@bitwarden/angular/services/modal.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { Organization } from "@bitwarden/common/models/domain/organization";
import { PasswordRepromptService } from "@bitwarden/common/vault/abstractions/password-reprompt.service";
import { CipherRepromptType } from "@bitwarden/common/vault/enums/cipher-reprompt-type";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";

import { AddEditComponent } from "../../../vault/app/vault/add-edit.component";
import { AddEditComponent as OrgAddEditComponent } from "../../organizations/vault/add-edit.component";

@Directive()
export class CipherReportComponent {
  @ViewChild("cipherAddEdit", { read: ViewContainerRef, static: true })
  cipherAddEditModalRef: ViewContainerRef;

  loading = false;
  hasLoaded = false;
  ciphers: CipherView[] = [];
  organization: Organization;

  constructor(
    private modalService: ModalService,
    protected messagingService: MessagingService,
    public requiresPaid: boolean,
    protected passwordRepromptService: PasswordRepromptService
  ) {}

  async load() {
    this.loading = true;
    await this.setCiphers();
    this.loading = false;
    this.hasLoaded = true;
  }

  async selectCipher(cipher: CipherView) {
    if (!(await this.repromptCipher(cipher))) {
      return;
    }

    const type = this.organization != null ? OrgAddEditComponent : AddEditComponent;

    const [modal, childComponent] = await this.modalService.openViewRef(
      type,
      this.cipherAddEditModalRef,
      (comp: OrgAddEditComponent | AddEditComponent) => {
        if (this.organization != null) {
          (comp as OrgAddEditComponent).organization = this.organization;
          comp.organizationId = this.organization.id;
        }

        comp.cipherId = cipher == null ? null : cipher.id;
        // eslint-disable-next-line rxjs/no-async-subscribe
        comp.onSavedCipher.subscribe(async () => {
          modal.close();
          await this.load();
        });
        // eslint-disable-next-line rxjs/no-async-subscribe
        comp.onDeletedCipher.subscribe(async () => {
          modal.close();
          await this.load();
        });
        // eslint-disable-next-line rxjs/no-async-subscribe
        comp.onRestoredCipher.subscribe(async () => {
          modal.close();
          await this.load();
        });
      }
    );

    return childComponent;
  }

  protected async checkAccess(): Promise<boolean> {
    if (this.organization != null) {
      // TODO: Maybe we want to just make sure they are not on a free plan? Just compare useTotp for now
      // since all paid plans include useTotp
      if (this.requiresPaid && !this.organization.useTotp) {
        this.messagingService.send("upgradeOrganization", { organizationId: this.organization.id });
        return false;
      }
    }
    return true;
  }

  protected async setCiphers() {
    this.ciphers = [];
  }

  protected async repromptCipher(c: CipherView) {
    return (
      c.reprompt === CipherRepromptType.None ||
      (await this.passwordRepromptService.showPasswordPrompt())
    );
  }
}
