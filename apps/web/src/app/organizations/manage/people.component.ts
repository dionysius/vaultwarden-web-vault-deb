import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { combineLatest, concatMap, Subject, takeUntil } from "rxjs";

import { SearchPipe } from "@bitwarden/angular/pipes/search.pipe";
import { UserNamePipe } from "@bitwarden/angular/pipes/user-name.pipe";
import { ModalService } from "@bitwarden/angular/services/modal.service";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { OrganizationUserService } from "@bitwarden/common/abstractions/organization-user/organization-user.service";
import { OrganizationUserConfirmRequest } from "@bitwarden/common/abstractions/organization-user/requests";
import {
  OrganizationUserBulkResponse,
  OrganizationUserUserDetailsResponse,
} from "@bitwarden/common/abstractions/organization-user/responses";
import { OrganizationApiServiceAbstraction } from "@bitwarden/common/abstractions/organization/organization-api.service.abstraction";
import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { PolicyService } from "@bitwarden/common/abstractions/policy/policy.service.abstraction";
import { SearchService } from "@bitwarden/common/abstractions/search.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { SyncService } from "@bitwarden/common/abstractions/sync/sync.service.abstraction";
import { ValidationService } from "@bitwarden/common/abstractions/validation.service";
import { OrganizationUserStatusType } from "@bitwarden/common/enums/organizationUserStatusType";
import { OrganizationUserType } from "@bitwarden/common/enums/organizationUserType";
import { PolicyType } from "@bitwarden/common/enums/policyType";
import { ProductType } from "@bitwarden/common/enums/productType";
import { Organization } from "@bitwarden/common/models/domain/organization";
import { OrganizationKeysRequest } from "@bitwarden/common/models/request/organization-keys.request";
import { ListResponse } from "@bitwarden/common/models/response/list.response";
import { DialogService } from "@bitwarden/components";

import { BasePeopleComponent } from "../../common/base.people.component";

import { BulkConfirmComponent } from "./bulk/bulk-confirm.component";
import { BulkRemoveComponent } from "./bulk/bulk-remove.component";
import { BulkRestoreRevokeComponent } from "./bulk/bulk-restore-revoke.component";
import { BulkStatusComponent } from "./bulk/bulk-status.component";
import { EntityEventsComponent } from "./entity-events.component";
import { OrgUpgradeDialogComponent } from "./org-upgrade-dialog/org-upgrade-dialog.component";
import { ResetPasswordComponent } from "./reset-password.component";
import { UserAddEditComponent } from "./user-add-edit.component";
import { UserGroupsComponent } from "./user-groups.component";

@Component({
  selector: "app-org-people",
  templateUrl: "people.component.html",
})
export class PeopleComponent
  extends BasePeopleComponent<OrganizationUserUserDetailsResponse>
  implements OnInit, OnDestroy
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

  organization: Organization;
  status: OrganizationUserStatusType = null;
  orgResetPasswordPolicyEnabled = false;

  private destroy$ = new Subject<void>();

  constructor(
    apiService: ApiService,
    private route: ActivatedRoute,
    i18nService: I18nService,
    modalService: ModalService,
    platformUtilsService: PlatformUtilsService,
    cryptoService: CryptoService,
    searchService: SearchService,
    validationService: ValidationService,
    private policyService: PolicyService,
    logService: LogService,
    searchPipe: SearchPipe,
    userNamePipe: UserNamePipe,
    private syncService: SyncService,
    stateService: StateService,
    private organizationService: OrganizationService,
    private organizationApiService: OrganizationApiServiceAbstraction,
    private organizationUserService: OrganizationUserService,
    private dialogService: DialogService
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
    combineLatest([this.route.params, this.route.queryParams, this.policyService.policies$])
      .pipe(
        concatMap(async ([params, qParams, policies]) => {
          this.organization = await this.organizationService.get(params.organizationId);

          // Backfill pub/priv key if necessary
          if (
            this.organization.canManageUsersPassword &&
            !this.organization.hasPublicAndPrivateKeys
          ) {
            const orgShareKey = await this.cryptoService.getOrgKey(this.organization.id);
            const orgKeys = await this.cryptoService.makeKeyPair(orgShareKey);
            const request = new OrganizationKeysRequest(orgKeys[0], orgKeys[1].encryptedString);
            const response = await this.organizationApiService.updateKeys(
              this.organization.id,
              request
            );
            if (response != null) {
              this.organization.hasPublicAndPrivateKeys =
                response.publicKey != null && response.privateKey != null;
              await this.syncService.fullSync(true); // Replace oganizations with new data
            } else {
              throw new Error(this.i18nService.t("resetPasswordOrgKeysError"));
            }
          }

          const resetPasswordPolicy = policies
            .filter((policy) => policy.type === PolicyType.ResetPassword)
            .find((p) => p.organizationId === this.organization.id);
          this.orgResetPasswordPolicyEnabled = resetPasswordPolicy?.enabled;

          await this.load();

          this.searchText = qParams.search;
          if (qParams.viewEvents != null) {
            const user = this.users.filter((u) => u.id === qParams.viewEvents);
            if (user.length > 0 && user[0].status === OrganizationUserStatusType.Confirmed) {
              this.events(user[0]);
            }
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async load() {
    super.load();
    await super.load();
  }

  getUsers(): Promise<ListResponse<OrganizationUserUserDetailsResponse>> {
    return this.organizationUserService.getAllUsers(this.organization.id);
  }

  deleteUser(id: string): Promise<void> {
    return this.organizationUserService.deleteOrganizationUser(this.organization.id, id);
  }

  revokeUser(id: string): Promise<void> {
    return this.organizationUserService.revokeOrganizationUser(this.organization.id, id);
  }

  restoreUser(id: string): Promise<void> {
    return this.organizationUserService.restoreOrganizationUser(this.organization.id, id);
  }

  reinviteUser(id: string): Promise<void> {
    return this.organizationUserService.postOrganizationUserReinvite(this.organization.id, id);
  }

  async confirmUser(
    user: OrganizationUserUserDetailsResponse,
    publicKey: Uint8Array
  ): Promise<void> {
    const orgKey = await this.cryptoService.getOrgKey(this.organization.id);
    const key = await this.cryptoService.rsaEncrypt(orgKey.key, publicKey.buffer);
    const request = new OrganizationUserConfirmRequest();
    request.key = key.encryptedString;
    await this.organizationUserService.postOrganizationUserConfirm(
      this.organization.id,
      user.id,
      request
    );
  }

  allowResetPassword(orgUser: OrganizationUserUserDetailsResponse): boolean {
    // Hierarchy check
    let callingUserHasPermission = false;

    switch (this.organization.type) {
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
      this.organization.canManageUsersPassword &&
      callingUserHasPermission &&
      this.organization.useResetPassword &&
      this.organization.hasPublicAndPrivateKeys &&
      orgUser.resetPasswordEnrolled &&
      this.orgResetPasswordPolicyEnabled &&
      orgUser.status === OrganizationUserStatusType.Confirmed
    );
  }

  showEnrolledStatus(orgUser: OrganizationUserUserDetailsResponse): boolean {
    return (
      this.organization.useResetPassword &&
      orgUser.resetPasswordEnrolled &&
      this.orgResetPasswordPolicyEnabled
    );
  }

  async edit(user: OrganizationUserUserDetailsResponse) {
    // Invite User: Add Flow
    // Click on user email: Edit Flow

    // User attempting to invite new users in a free org with max users
    if (
      !user &&
      this.organization.planProductType === ProductType.Free &&
      this.allUsers.length === this.organization.seats
    ) {
      // Show org upgrade modal

      const dialogBodyText = this.organization.canManageBilling
        ? this.i18nService.t(
            "freeOrgInvLimitReachedManageBilling",
            this.organization.seats.toString()
          )
        : this.i18nService.t(
            "freeOrgInvLimitReachedNoManageBilling",
            this.organization.seats.toString()
          );

      this.dialogService.open(OrgUpgradeDialogComponent, {
        data: {
          orgId: this.organization.id,
          orgCanManageBilling: this.organization.canManageBilling,
          dialogBodyText: dialogBodyText,
        },
      });
      return;
    }

    const [modal] = await this.modalService.openViewRef(
      UserAddEditComponent,
      this.addEditModalRef,
      (comp) => {
        comp.name = this.userNamePipe.transform(user);
        comp.organizationId = this.organization.id;
        comp.organizationUserId = user?.id || null;
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
        comp.organizationId = this.organization.id;
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
        comp.organizationId = this.organization.id;
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
        organizationId: this.organization.id,
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
      const response = this.organizationUserService.postManyOrganizationUserReinvite(
        this.organization.id,
        filteredUsers.map((user) => user.id)
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
        comp.organizationId = this.organization.id;
        comp.users = this.getCheckedUsers();
      }
    );

    await modal.onClosedPromise();
    await this.load();
  }

  async events(user: OrganizationUserUserDetailsResponse) {
    await this.modalService.openViewRef(EntityEventsComponent, this.eventsModalRef, (comp) => {
      comp.name = this.userNamePipe.transform(user);
      comp.organizationId = this.organization.id;
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
        comp.organizationId = this.organization.id;
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
