import { Component, OnInit, ViewChild, ViewContainerRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";

import { SearchPipe } from "@bitwarden/angular/pipes/search.pipe";
import { UserNamePipe } from "@bitwarden/angular/pipes/user-name.pipe";
import { ModalService } from "@bitwarden/angular/services/modal.service";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { OrganizationApiServiceAbstraction } from "@bitwarden/common/abstractions/organization/organization-api.service.abstraction";
import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { PolicyApiServiceAbstraction } from "@bitwarden/common/abstractions/policy/policy-api.service.abstraction";
import { PolicyService } from "@bitwarden/common/abstractions/policy/policy.service.abstraction";
import { SearchService } from "@bitwarden/common/abstractions/search.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { SyncService } from "@bitwarden/common/abstractions/sync/sync.service.abstraction";
import { ValidationService } from "@bitwarden/common/abstractions/validation.service";
import { OrganizationUserStatusType } from "@bitwarden/common/enums/organizationUserStatusType";
import { OrganizationUserType } from "@bitwarden/common/enums/organizationUserType";
import { PolicyType } from "@bitwarden/common/enums/policyType";
import { OrganizationKeysRequest } from "@bitwarden/common/models/request/organizationKeysRequest";
import { OrganizationUserBulkRequest } from "@bitwarden/common/models/request/organizationUserBulkRequest";
import { OrganizationUserConfirmRequest } from "@bitwarden/common/models/request/organizationUserConfirmRequest";
import { ListResponse } from "@bitwarden/common/models/response/listResponse";
import { OrganizationUserBulkResponse } from "@bitwarden/common/models/response/organizationUserBulkResponse";
import { OrganizationUserUserDetailsResponse } from "@bitwarden/common/models/response/organizationUserResponse";

import { BasePeopleComponent } from "../../common/base.people.component";

import { BulkConfirmComponent } from "./bulk/bulk-confirm.component";
import { BulkRemoveComponent } from "./bulk/bulk-remove.component";
import { BulkRestoreRevokeComponent } from "./bulk/bulk-restore-revoke.component";
import { BulkStatusComponent } from "./bulk/bulk-status.component";
import { EntityEventsComponent } from "./entity-events.component";
import { ResetPasswordComponent } from "./reset-password.component";
import { UserAddEditComponent } from "./user-add-edit.component";
import { UserGroupsComponent } from "./user-groups.component";

@Component({
  selector: "app-org-people",
  templateUrl: "people.component.html",
})
// eslint-disable-next-line rxjs-angular/prefer-takeuntil
export class PeopleComponent
  extends BasePeopleComponent<OrganizationUserUserDetailsResponse>
  implements OnInit
{
  @ViewChild("addEdit", { read: ViewContainerRef, static: true }) addEditModalRef: ViewContainerRef;
  @ViewChild("groupsTemplate", { read: ViewContainerRef, static: true })
  groupsModalRef: ViewContainerRef;
  @ViewChild("eventsTemplate", { read: ViewContainerRef, static: true })
  eventsModalRef: ViewContainerRef;
  @ViewChild("confirmTemplate", { read: ViewContainerRef, static: true })
  confirmModalRef: ViewContainerRef;
  @ViewChild("resetPasswordTemplate", { read: ViewContainerRef, static: true })
  resetPasswordModalRef: ViewContainerRef;
  @ViewChild("bulkStatusTemplate", { read: ViewContainerRef, static: true })
  bulkStatusModalRef: ViewContainerRef;
  @ViewChild("bulkConfirmTemplate", { read: ViewContainerRef, static: true })
  bulkConfirmModalRef: ViewContainerRef;
  @ViewChild("bulkRemoveTemplate", { read: ViewContainerRef, static: true })
  bulkRemoveModalRef: ViewContainerRef;

  userType = OrganizationUserType;
  userStatusType = OrganizationUserStatusType;

  organizationId: string;
  status: OrganizationUserStatusType = null;
  accessEvents = false;
  accessGroups = false;
  canResetPassword = false; // User permission (admin/custom)
  orgUseResetPassword = false; // Org plan ability
  orgHasKeys = false; // Org public/private keys
  orgResetPasswordPolicyEnabled = false;
  callingUserType: OrganizationUserType = null;

  constructor(
    apiService: ApiService,
    private route: ActivatedRoute,
    i18nService: I18nService,
    modalService: ModalService,
    platformUtilsService: PlatformUtilsService,
    cryptoService: CryptoService,
    private router: Router,
    searchService: SearchService,
    validationService: ValidationService,
    private policyApiService: PolicyApiServiceAbstraction,
    private policyService: PolicyService,
    logService: LogService,
    searchPipe: SearchPipe,
    userNamePipe: UserNamePipe,
    private syncService: SyncService,
    stateService: StateService,
    private organizationService: OrganizationService,
    private organizationApiService: OrganizationApiServiceAbstraction
  ) {
    super(
      apiService,
      searchService,
      i18nService,
      platformUtilsService,
      cryptoService,
      validationService,
      modalService,
      logService,
      searchPipe,
      userNamePipe,
      stateService
    );
  }

  async ngOnInit() {
    // eslint-disable-next-line rxjs-angular/prefer-takeuntil, rxjs/no-async-subscribe
    this.route.parent.parent.params.subscribe(async (params) => {
      this.organizationId = params.organizationId;
      const organization = await this.organizationService.get(this.organizationId);
      this.accessEvents = organization.useEvents;
      this.accessGroups = organization.useGroups;
      this.canResetPassword = organization.canManageUsersPassword;
      this.orgUseResetPassword = organization.useResetPassword;
      this.callingUserType = organization.type;
      this.orgHasKeys = organization.hasPublicAndPrivateKeys;

      // Backfill pub/priv key if necessary
      if (this.canResetPassword && !this.orgHasKeys) {
        const orgShareKey = await this.cryptoService.getOrgKey(this.organizationId);
        const orgKeys = await this.cryptoService.makeKeyPair(orgShareKey);
        const request = new OrganizationKeysRequest(orgKeys[0], orgKeys[1].encryptedString);
        const response = await this.organizationApiService.updateKeys(this.organizationId, request);
        if (response != null) {
          this.orgHasKeys = response.publicKey != null && response.privateKey != null;
          await this.syncService.fullSync(true); // Replace oganizations with new data
        } else {
          throw new Error(this.i18nService.t("resetPasswordOrgKeysError"));
        }
      }

      await this.load();

      // eslint-disable-next-line rxjs-angular/prefer-takeuntil, rxjs/no-async-subscribe, rxjs/no-nested-subscribe
      this.route.queryParams.pipe(first()).subscribe(async (qParams) => {
        this.searchText = qParams.search;
        if (qParams.viewEvents != null) {
          const user = this.users.filter((u) => u.id === qParams.viewEvents);
          if (user.length > 0 && user[0].status === OrganizationUserStatusType.Confirmed) {
            this.events(user[0]);
          }
        }
      });
    });
  }

  async load() {
    const resetPasswordPolicy = await this.policyApiService.getPolicyForOrganization(
      PolicyType.ResetPassword,
      this.organizationId
    );
    this.orgResetPasswordPolicyEnabled = resetPasswordPolicy?.enabled;
    super.load();
  }

  getUsers(): Promise<ListResponse<OrganizationUserUserDetailsResponse>> {
    return this.apiService.getOrganizationUsers(this.organizationId);
  }

  deleteUser(id: string): Promise<void> {
    return this.apiService.deleteOrganizationUser(this.organizationId, id);
  }

  revokeUser(id: string): Promise<void> {
    return this.apiService.revokeOrganizationUser(this.organizationId, id);
  }

  restoreUser(id: string): Promise<void> {
    return this.apiService.restoreOrganizationUser(this.organizationId, id);
  }

  reinviteUser(id: string): Promise<void> {
    return this.apiService.postOrganizationUserReinvite(this.organizationId, id);
  }

  async confirmUser(
    user: OrganizationUserUserDetailsResponse,
    publicKey: Uint8Array
  ): Promise<void> {
    const orgKey = await this.cryptoService.getOrgKey(this.organizationId);
    const key = await this.cryptoService.rsaEncrypt(orgKey.key, publicKey.buffer);
    const request = new OrganizationUserConfirmRequest();
    request.key = key.encryptedString;
    await this.apiService.postOrganizationUserConfirm(this.organizationId, user.id, request);
  }

  allowResetPassword(orgUser: OrganizationUserUserDetailsResponse): boolean {
    // Hierarchy check
    let callingUserHasPermission = false;

    switch (this.callingUserType) {
      case OrganizationUserType.Owner:
        callingUserHasPermission = true;
        break;
      case OrganizationUserType.Admin:
        callingUserHasPermission = orgUser.type !== OrganizationUserType.Owner;
        break;
      case OrganizationUserType.Custom:
        callingUserHasPermission =
          orgUser.type !== OrganizationUserType.Owner &&
          orgUser.type !== OrganizationUserType.Admin;
        break;
    }

    // Final
    return (
      this.canResetPassword &&
      callingUserHasPermission &&
      this.orgUseResetPassword &&
      this.orgHasKeys &&
      orgUser.resetPasswordEnrolled &&
      this.orgResetPasswordPolicyEnabled &&
      orgUser.status === OrganizationUserStatusType.Confirmed
    );
  }

  showEnrolledStatus(orgUser: OrganizationUserUserDetailsResponse): boolean {
    return (
      this.orgUseResetPassword &&
      orgUser.resetPasswordEnrolled &&
      this.orgResetPasswordPolicyEnabled
    );
  }

  async edit(user: OrganizationUserUserDetailsResponse) {
    const [modal] = await this.modalService.openViewRef(
      UserAddEditComponent,
      this.addEditModalRef,
      (comp) => {
        comp.name = this.userNamePipe.transform(user);
        comp.organizationId = this.organizationId;
        comp.organizationUserId = user != null ? user.id : null;
        comp.usesKeyConnector = user?.usesKeyConnector;
        // eslint-disable-next-line rxjs-angular/prefer-takeuntil
        comp.onSavedUser.subscribe(() => {
          modal.close();
          this.load();
        });
        // eslint-disable-next-line rxjs-angular/prefer-takeuntil
        comp.onDeletedUser.subscribe(() => {
          modal.close();
          this.removeUser(user);
        });
        // eslint-disable-next-line rxjs-angular/prefer-takeuntil
        comp.onRevokedUser.subscribe(() => {
          modal.close();
          this.load();
        });
        // eslint-disable-next-line rxjs-angular/prefer-takeuntil
        comp.onRestoredUser.subscribe(() => {
          modal.close();
          this.load();
        });
      }
    );
  }

  async groups(user: OrganizationUserUserDetailsResponse) {
    const [modal] = await this.modalService.openViewRef(
      UserGroupsComponent,
      this.groupsModalRef,
      (comp) => {
        comp.name = this.userNamePipe.transform(user);
        comp.organizationId = this.organizationId;
        comp.organizationUserId = user != null ? user.id : null;
        // eslint-disable-next-line rxjs-angular/prefer-takeuntil
        comp.onSavedUser.subscribe(() => {
          modal.close();
        });
      }
    );
  }

  async bulkRemove() {
    if (this.actionPromise != null) {
      return;
    }

    const [modal] = await this.modalService.openViewRef(
      BulkRemoveComponent,
      this.bulkRemoveModalRef,
      (comp) => {
        comp.organizationId = this.organizationId;
        comp.users = this.getCheckedUsers();
      }
    );

    await modal.onClosedPromise();
    await this.load();
  }

  async bulkRevoke() {
    await this.bulkRevokeOrRestore(true);
  }

  async bulkRestore() {
    await this.bulkRevokeOrRestore(false);
  }

  async bulkRevokeOrRestore(isRevoking: boolean) {
    if (this.actionPromise != null) {
      return;
    }

    const ref = this.modalService.open(BulkRestoreRevokeComponent, {
      allowMultipleModals: true,
      data: {
        organizationId: this.organizationId,
        users: this.getCheckedUsers(),
        isRevoking: isRevoking,
      },
    });

    await ref.onClosedPromise();
    await this.load();
  }

  async bulkReinvite() {
    if (this.actionPromise != null) {
      return;
    }

    const users = this.getCheckedUsers();
    const filteredUsers = users.filter((u) => u.status === OrganizationUserStatusType.Invited);

    if (filteredUsers.length <= 0) {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("noSelectedUsersApplicable")
      );
      return;
    }

    try {
      const request = new OrganizationUserBulkRequest(filteredUsers.map((user) => user.id));
      const response = this.apiService.postManyOrganizationUserReinvite(
        this.organizationId,
        request
      );
      this.showBulkStatus(
        users,
        filteredUsers,
        response,
        this.i18nService.t("bulkReinviteMessage")
      );
    } catch (e) {
      this.validationService.showError(e);
    }
    this.actionPromise = null;
  }

  async bulkConfirm() {
    if (this.actionPromise != null) {
      return;
    }

    const [modal] = await this.modalService.openViewRef(
      BulkConfirmComponent,
      this.bulkConfirmModalRef,
      (comp) => {
        comp.organizationId = this.organizationId;
        comp.users = this.getCheckedUsers();
      }
    );

    await modal.onClosedPromise();
    await this.load();
  }

  async events(user: OrganizationUserUserDetailsResponse) {
    await this.modalService.openViewRef(EntityEventsComponent, this.eventsModalRef, (comp) => {
      comp.name = this.userNamePipe.transform(user);
      comp.organizationId = this.organizationId;
      comp.entityId = user.id;
      comp.showUser = false;
      comp.entity = "user";
    });
  }

  async resetPassword(user: OrganizationUserUserDetailsResponse) {
    const [modal] = await this.modalService.openViewRef(
      ResetPasswordComponent,
      this.resetPasswordModalRef,
      (comp) => {
        comp.name = this.userNamePipe.transform(user);
        comp.email = user != null ? user.email : null;
        comp.organizationId = this.organizationId;
        comp.id = user != null ? user.id : null;

        // eslint-disable-next-line rxjs-angular/prefer-takeuntil
        comp.onPasswordReset.subscribe(() => {
          modal.close();
          this.load();
        });
      }
    );
  }

  protected async removeUserConfirmationDialog(user: OrganizationUserUserDetailsResponse) {
    const warningMessage = user.usesKeyConnector
      ? this.i18nService.t("removeUserConfirmationKeyConnector")
      : this.i18nService.t("removeOrgUserConfirmation");

    return this.platformUtilsService.showDialog(
      warningMessage,
      this.i18nService.t("removeUserIdAccess", this.userNamePipe.transform(user)),
      this.i18nService.t("yes"),
      this.i18nService.t("no"),
      "warning"
    );
  }

  private async showBulkStatus(
    users: OrganizationUserUserDetailsResponse[],
    filteredUsers: OrganizationUserUserDetailsResponse[],
    request: Promise<ListResponse<OrganizationUserBulkResponse>>,
    successfullMessage: string
  ) {
    const [modal, childComponent] = await this.modalService.openViewRef(
      BulkStatusComponent,
      this.bulkStatusModalRef,
      (comp) => {
        comp.loading = true;
      }
    );

    // Workaround to handle closing the modal shortly after it has been opened
    let close = false;
    // eslint-disable-next-line rxjs-angular/prefer-takeuntil
    modal.onShown.subscribe(() => {
      if (close) {
        modal.close();
      }
    });

    try {
      const response = await request;

      if (modal) {
        const keyedErrors: any = response.data
          .filter((r) => r.error !== "")
          .reduce((a, x) => ({ ...a, [x.id]: x.error }), {});
        const keyedFilteredUsers: any = filteredUsers.reduce((a, x) => ({ ...a, [x.id]: x }), {});

        childComponent.users = users.map((user) => {
          let message = keyedErrors[user.id] ?? successfullMessage;
          // eslint-disable-next-line
          if (!keyedFilteredUsers.hasOwnProperty(user.id)) {
            message = this.i18nService.t("bulkFilteredMessage");
          }

          return {
            user: user,
            error: keyedErrors.hasOwnProperty(user.id), // eslint-disable-line
            message: message,
          };
        });
        childComponent.loading = false;
      }
    } catch {
      close = true;
      modal.close();
    }
  }
}
