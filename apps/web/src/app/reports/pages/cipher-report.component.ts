import { Directive, ViewChild, ViewContainerRef } from "@angular/core";
import { Observable } from "rxjs";

import { ModalService } from "@bitwarden/angular/services/modal.service";
import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { CipherRepromptType } from "@bitwarden/common/vault/enums/cipher-reprompt-type";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import { PasswordRepromptService } from "@bitwarden/vault";

import { AddEditComponent } from "../../vault/individual-vault/add-edit.component";
import { AddEditComponent as OrgAddEditComponent } from "../../vault/org-vault/add-edit.component";

@Directive()
export class CipherReportComponent {
  @ViewChild("cipherAddEdit", { read: ViewContainerRef, static: true })
  cipherAddEditModalRef: ViewContainerRef;

  loading = false;
  hasLoaded = false;
  ciphers: CipherView[] = [];
  organization: Organization;
  organizations$: Observable<Organization[]>;

  constructor(
    private modalService: ModalService,
    protected passwordRepromptService: PasswordRepromptService,
    protected organizationService: OrganizationService,
  ) {
    this.organizations$ = this.organizationService.organizations$;
  }

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
      },
    );

    return childComponent;
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
