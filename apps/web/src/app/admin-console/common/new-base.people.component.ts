import { Directive, ViewChild, ViewContainerRef } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl } from "@angular/forms";
import { firstValueFrom, lastValueFrom, debounceTime } from "rxjs";

import { UserNamePipe } from "@bitwarden/angular/pipes/user-name.pipe";
import { ModalService } from "@bitwarden/angular/services/modal.service";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { OrganizationManagementPreferencesService } from "@bitwarden/common/admin-console/abstractions/organization-management-preferences/organization-management-preferences.service";
import {
  OrganizationUserStatusType,
  OrganizationUserType,
  ProviderUserStatusType,
  ProviderUserType,
} from "@bitwarden/common/admin-console/enums";
import { ProviderUserUserDetailsResponse } from "@bitwarden/common/admin-console/models/response/provider/provider-user.response";
import { ListResponse } from "@bitwarden/common/models/response/list.response";
import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { ValidationService } from "@bitwarden/common/platform/abstractions/validation.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";
import { DialogService, TableDataSource } from "@bitwarden/components";

import { OrganizationUserView } from "../organizations/core/views/organization-user.view";
import { UserConfirmComponent } from "../organizations/manage/user-confirm.component";

type StatusType = OrganizationUserStatusType | ProviderUserStatusType;

const MaxCheckedCount = 500;

/**
 * A refactored copy of BasePeopleComponent, using the component library table and other modern features.
 * This will replace BasePeopleComponent once all subclasses have been changed over to use this class.
 */
@Directive()
export abstract class NewBasePeopleComponent<
  UserView extends ProviderUserUserDetailsResponse | OrganizationUserView,
> {
  @ViewChild("confirmTemplate", { read: ViewContainerRef, static: true })
  confirmModalRef: ViewContainerRef;

  get allCount() {
    return this.activeUsers != null ? this.activeUsers.length : 0;
  }

  get invitedCount() {
    return this.statusMap.has(this.userStatusType.Invited)
      ? this.statusMap.get(this.userStatusType.Invited).length
      : 0;
  }

  get acceptedCount() {
    return this.statusMap.has(this.userStatusType.Accepted)
      ? this.statusMap.get(this.userStatusType.Accepted).length
      : 0;
  }

  get confirmedCount() {
    return this.statusMap.has(this.userStatusType.Confirmed)
      ? this.statusMap.get(this.userStatusType.Confirmed).length
      : 0;
  }

  get revokedCount() {
    return this.statusMap.has(this.userStatusType.Revoked)
      ? this.statusMap.get(this.userStatusType.Revoked).length
      : 0;
  }

  /**
   * Shows a banner alerting the admin that users need to be confirmed.
   */
  get showConfirmUsers(): boolean {
    return (
      this.activeUsers != null &&
      this.statusMap != null &&
      this.activeUsers.length > 1 &&
      this.confirmedCount > 0 &&
      this.confirmedCount < 3 &&
      this.acceptedCount > 0
    );
  }

  get showBulkConfirmUsers(): boolean {
    return this.acceptedCount > 0;
  }

  abstract userType: typeof OrganizationUserType | typeof ProviderUserType;
  abstract userStatusType: typeof OrganizationUserStatusType | typeof ProviderUserStatusType;

  protected dataSource = new TableDataSource<UserView>();

  firstLoaded: boolean;

  /**
   * A hashmap that groups users by their status (invited/accepted/etc). This is used by the toggles to show
   * user counts and filter data by user status.
   */
  statusMap = new Map<StatusType, UserView[]>();

  /**
   * The currently selected status filter, or null to show all active users.
   */
  status: StatusType | null;

  /**
   * The currently executing promise - used to avoid multiple user actions executing at once.
   */
  actionPromise: Promise<void>;

  /**
   * All users, loaded from the server, before any filtering has been applied.
   */
  protected allUsers: UserView[] = [];

  /**
   * Active users only, that is, users that are not in the revoked status.
   */
  protected activeUsers: UserView[] = [];

  protected searchControl = new FormControl("", { nonNullable: true });

  constructor(
    protected apiService: ApiService,
    protected i18nService: I18nService,
    protected platformUtilsService: PlatformUtilsService,
    protected cryptoService: CryptoService,
    protected validationService: ValidationService,
    protected modalService: ModalService,
    private logService: LogService,
    protected userNamePipe: UserNamePipe,
    protected dialogService: DialogService,
    protected organizationManagementPreferencesService: OrganizationManagementPreferencesService,
  ) {
    // Connect the search input to the table dataSource filter input
    this.searchControl.valueChanges
      .pipe(debounceTime(200), takeUntilDestroyed())
      .subscribe((v) => (this.dataSource.filter = v));
  }

  abstract edit(user: UserView): void;
  abstract getUsers(): Promise<ListResponse<UserView> | UserView[]>;
  abstract deleteUser(id: string): Promise<void>;
  abstract revokeUser(id: string): Promise<void>;
  abstract restoreUser(id: string): Promise<void>;
  abstract reinviteUser(id: string): Promise<void>;
  abstract confirmUser(user: UserView, publicKey: Uint8Array): Promise<void>;

  async load() {
    // Load new users from the server
    const response = await this.getUsers();

    // Reset and repopulate the statusMap
    this.statusMap.clear();
    this.activeUsers = [];
    for (const status of Utils.iterateEnum(this.userStatusType)) {
      this.statusMap.set(status, []);
    }

    if (response instanceof ListResponse) {
      this.allUsers = response.data != null && response.data.length > 0 ? response.data : [];
    } else if (Array.isArray(response)) {
      this.allUsers = response;
    }

    this.allUsers.forEach((u) => {
      if (!this.statusMap.has(u.status)) {
        this.statusMap.set(u.status, [u]);
      } else {
        this.statusMap.get(u.status).push(u);
      }
      if (u.status !== this.userStatusType.Revoked) {
        this.activeUsers.push(u);
      }
    });

    // Filter based on UserStatus - this also populates the table on first load
    this.filter(this.status);

    this.firstLoaded = true;
  }

  /**
   * Filter the data source by user status.
   * This overwrites dataSource.data because this filtering needs to apply first, before the search input
   */
  filter(status: StatusType | null) {
    this.status = status;
    if (this.status != null) {
      this.dataSource.data = this.statusMap.get(this.status);
    } else {
      this.dataSource.data = this.activeUsers;
    }
    // Reset checkbox selection
    this.selectAll(false);
  }

  checkUser(user: UserView, select?: boolean) {
    (user as any).checked = select == null ? !(user as any).checked : select;
  }

  selectAll(select: boolean) {
    if (select) {
      // Reset checkbox selection first so we know nothing else is selected
      this.selectAll(false);
    }

    const filteredUsers = this.dataSource.filteredData;

    const selectCount =
      select && filteredUsers.length > MaxCheckedCount ? MaxCheckedCount : filteredUsers.length;
    for (let i = 0; i < selectCount; i++) {
      this.checkUser(filteredUsers[i], select);
    }
  }

  invite() {
    this.edit(null);
  }

  protected async removeUserConfirmationDialog(user: UserView) {
    return this.dialogService.openSimpleDialog({
      title: this.userNamePipe.transform(user),
      content: { key: "removeUserConfirmation" },
      type: "warning",
    });
  }

  async remove(user: UserView) {
    const confirmed = await this.removeUserConfirmationDialog(user);
    if (!confirmed) {
      return false;
    }

    this.actionPromise = this.deleteUser(user.id);
    try {
      await this.actionPromise;
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("removedUserId", this.userNamePipe.transform(user)),
      );
      this.removeUser(user);
    } catch (e) {
      this.validationService.showError(e);
    }
    this.actionPromise = null;
  }

  protected async revokeUserConfirmationDialog(user: UserView) {
    return this.dialogService.openSimpleDialog({
      title: { key: "revokeAccess", placeholders: [this.userNamePipe.transform(user)] },
      content: this.revokeWarningMessage(),
      acceptButtonText: { key: "revokeAccess" },
      type: "warning",
    });
  }

  async revoke(user: UserView) {
    const confirmed = await this.revokeUserConfirmationDialog(user);

    if (!confirmed) {
      return false;
    }

    this.actionPromise = this.revokeUser(user.id);
    try {
      await this.actionPromise;
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("revokedUserId", this.userNamePipe.transform(user)),
      );
      await this.load();
    } catch (e) {
      this.validationService.showError(e);
    }
    this.actionPromise = null;
  }

  async restore(user: UserView) {
    this.actionPromise = this.restoreUser(user.id);
    try {
      await this.actionPromise;
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("restoredUserId", this.userNamePipe.transform(user)),
      );
      await this.load();
    } catch (e) {
      this.validationService.showError(e);
    }
    this.actionPromise = null;
  }

  async reinvite(user: UserView) {
    if (this.actionPromise != null) {
      return;
    }

    this.actionPromise = this.reinviteUser(user.id);
    try {
      await this.actionPromise;
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("hasBeenReinvited", this.userNamePipe.transform(user)),
      );
    } catch (e) {
      this.validationService.showError(e);
    }
    this.actionPromise = null;
  }

  async confirm(user: UserView) {
    function updateUser(self: NewBasePeopleComponent<UserView>) {
      user.status = self.userStatusType.Confirmed;
      const mapIndex = self.statusMap.get(self.userStatusType.Accepted).indexOf(user);
      if (mapIndex > -1) {
        self.statusMap.get(self.userStatusType.Accepted).splice(mapIndex, 1);
        self.statusMap.get(self.userStatusType.Confirmed).push(user);
      }
    }

    const confirmUser = async (publicKey: Uint8Array) => {
      try {
        this.actionPromise = this.confirmUser(user, publicKey);
        await this.actionPromise;
        updateUser(this);
        this.platformUtilsService.showToast(
          "success",
          null,
          this.i18nService.t("hasBeenConfirmed", this.userNamePipe.transform(user)),
        );
      } catch (e) {
        this.validationService.showError(e);
        throw e;
      } finally {
        this.actionPromise = null;
      }
    };

    if (this.actionPromise != null) {
      return;
    }

    try {
      const publicKeyResponse = await this.apiService.getUserPublicKey(user.userId);
      const publicKey = Utils.fromB64ToArray(publicKeyResponse.publicKey);

      const autoConfirm = await firstValueFrom(
        this.organizationManagementPreferencesService.autoConfirmFingerPrints.state$,
      );
      if (autoConfirm == null || !autoConfirm) {
        const dialogRef = UserConfirmComponent.open(this.dialogService, {
          data: {
            name: this.userNamePipe.transform(user),
            userId: user != null ? user.userId : null,
            publicKey: publicKey,
            confirmUser: () => confirmUser(publicKey),
          },
        });
        await lastValueFrom(dialogRef.closed);

        return;
      }

      try {
        const fingerprint = await this.cryptoService.getFingerprint(user.userId, publicKey);
        this.logService.info(`User's fingerprint: ${fingerprint.join("-")}`);
      } catch (e) {
        this.logService.error(e);
      }
      await confirmUser(publicKey);
    } catch (e) {
      this.logService.error(`Handled exception: ${e}`);
    }
  }

  protected revokeWarningMessage(): string {
    return this.i18nService.t("revokeUserConfirmation");
  }

  protected getCheckedUsers() {
    return this.dataSource.data.filter((u) => (u as any).checked);
  }

  /**
   * Remove a user row from the table and all related data sources
   */
  protected removeUser(user: UserView) {
    let index = this.dataSource.data.indexOf(user);
    if (index > -1) {
      // Clone the array so that the setter for dataSource.data is triggered to update the table rendering
      const updatedData = [...this.dataSource.data];
      updatedData.splice(index, 1);
      this.dataSource.data = updatedData;
    }

    index = this.allUsers.indexOf(user);
    if (index > -1) {
      this.allUsers.splice(index, 1);
    }

    if (this.statusMap.has(user.status)) {
      index = this.statusMap.get(user.status).indexOf(user);
      if (index > -1) {
        this.statusMap.get(user.status).splice(index, 1);
      }
    }
  }
}
