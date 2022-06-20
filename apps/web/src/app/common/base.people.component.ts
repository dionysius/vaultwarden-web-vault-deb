import { Directive, ViewChild, ViewContainerRef } from "@angular/core";

import { SearchPipe } from "@bitwarden/angular/pipes/search.pipe";
import { UserNamePipe } from "@bitwarden/angular/pipes/user-name.pipe";
import { ModalService } from "@bitwarden/angular/services/modal.service";
import { ValidationService } from "@bitwarden/angular/services/validation.service";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { SearchService } from "@bitwarden/common/abstractions/search.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { OrganizationUserStatusType } from "@bitwarden/common/enums/organizationUserStatusType";
import { OrganizationUserType } from "@bitwarden/common/enums/organizationUserType";
import { ProviderUserStatusType } from "@bitwarden/common/enums/providerUserStatusType";
import { ProviderUserType } from "@bitwarden/common/enums/providerUserType";
import { Utils } from "@bitwarden/common/misc/utils";
import { ListResponse } from "@bitwarden/common/models/response/listResponse";
import { OrganizationUserUserDetailsResponse } from "@bitwarden/common/models/response/organizationUserResponse";
import { ProviderUserUserDetailsResponse } from "@bitwarden/common/models/response/provider/providerUserResponse";

import { UserConfirmComponent } from "../organizations/manage/user-confirm.component";

type StatusType = OrganizationUserStatusType | ProviderUserStatusType;

const MaxCheckedCount = 500;

@Directive()
export abstract class BasePeopleComponent<
  UserType extends ProviderUserUserDetailsResponse | OrganizationUserUserDetailsResponse
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

  get deactivatedCount() {
    return this.statusMap.has(this.userStatusType.Deactivated)
      ? this.statusMap.get(this.userStatusType.Deactivated).length
      : 0;
  }

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

  loading = true;
  statusMap = new Map<StatusType, UserType[]>();
  status: StatusType;
  users: UserType[] = [];
  pagedUsers: UserType[] = [];
  searchText: string;
  actionPromise: Promise<any>;

  protected allUsers: UserType[] = [];
  protected activeUsers: UserType[] = [];

  protected didScroll = false;
  protected pageSize = 100;

  private pagedUsersCount = 0;

  constructor(
    protected apiService: ApiService,
    private searchService: SearchService,
    protected i18nService: I18nService,
    protected platformUtilsService: PlatformUtilsService,
    protected cryptoService: CryptoService,
    protected validationService: ValidationService,
    protected modalService: ModalService,
    private logService: LogService,
    private searchPipe: SearchPipe,
    protected userNamePipe: UserNamePipe,
    protected stateService: StateService
  ) {}

  abstract edit(user: UserType): void;
  abstract getUsers(): Promise<ListResponse<UserType>>;
  abstract deleteUser(id: string): Promise<any>;
  abstract deactivateUser(id: string): Promise<any>;
  abstract activateUser(id: string): Promise<any>;
  abstract reinviteUser(id: string): Promise<any>;
  abstract confirmUser(user: UserType, publicKey: Uint8Array): Promise<any>;

  async load() {
    const response = await this.getUsers();
    this.statusMap.clear();
    this.activeUsers = [];
    for (const status of Utils.iterateEnum(this.userStatusType)) {
      this.statusMap.set(status, []);
    }

    this.allUsers = response.data != null && response.data.length > 0 ? response.data : [];
    this.allUsers.sort(Utils.getSortFunction(this.i18nService, "email"));
    this.allUsers.forEach((u) => {
      if (!this.statusMap.has(u.status)) {
        this.statusMap.set(u.status, [u]);
      } else {
        this.statusMap.get(u.status).push(u);
      }
      if (u.status !== this.userStatusType.Deactivated) {
        this.activeUsers.push(u);
      }
    });
    this.filter(this.status);
    this.loading = false;
  }

  filter(status: StatusType) {
    this.status = status;
    if (this.status != null) {
      this.users = this.statusMap.get(this.status);
    } else {
      this.users = this.activeUsers;
    }
    // Reset checkbox selecton
    this.selectAll(false);
    this.resetPaging();
  }

  loadMore() {
    if (!this.users || this.users.length <= this.pageSize) {
      return;
    }
    const pagedLength = this.pagedUsers.length;
    let pagedSize = this.pageSize;
    if (pagedLength === 0 && this.pagedUsersCount > this.pageSize) {
      pagedSize = this.pagedUsersCount;
    }
    if (this.users.length > pagedLength) {
      this.pagedUsers = this.pagedUsers.concat(
        this.users.slice(pagedLength, pagedLength + pagedSize)
      );
    }
    this.pagedUsersCount = this.pagedUsers.length;
    this.didScroll = this.pagedUsers.length > this.pageSize;
  }

  checkUser(user: OrganizationUserUserDetailsResponse, select?: boolean) {
    (user as any).checked = select == null ? !(user as any).checked : select;
  }

  selectAll(select: boolean) {
    if (select) {
      this.selectAll(false);
    }

    const filteredUsers = this.searchPipe.transform(
      this.users,
      this.searchText,
      "name",
      "email",
      "id"
    );

    const selectCount =
      select && filteredUsers.length > MaxCheckedCount ? MaxCheckedCount : filteredUsers.length;
    for (let i = 0; i < selectCount; i++) {
      this.checkUser(filteredUsers[i], select);
    }
  }

  async resetPaging() {
    this.pagedUsers = [];
    this.loadMore();
  }

  invite() {
    this.edit(null);
  }

  async remove(user: UserType) {
    const confirmed = await this.platformUtilsService.showDialog(
      this.deleteWarningMessage(user),
      this.userNamePipe.transform(user),
      this.i18nService.t("yes"),
      this.i18nService.t("no"),
      "warning"
    );

    if (!confirmed) {
      return false;
    }

    this.actionPromise = this.deleteUser(user.id);
    try {
      await this.actionPromise;
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("removedUserId", this.userNamePipe.transform(user))
      );
      this.removeUser(user);
    } catch (e) {
      this.validationService.showError(e);
    }
    this.actionPromise = null;
  }

  async deactivate(user: UserType) {
    const confirmed = await this.platformUtilsService.showDialog(
      this.deactivateWarningMessage(),
      this.i18nService.t("deactivateUserId", this.userNamePipe.transform(user)),
      this.i18nService.t("deactivate"),
      this.i18nService.t("cancel"),
      "warning"
    );

    if (!confirmed) {
      return false;
    }

    this.actionPromise = this.deactivateUser(user.id);
    try {
      await this.actionPromise;
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("deactivatedUserId", this.userNamePipe.transform(user))
      );
      await this.load();
    } catch (e) {
      this.validationService.showError(e);
    }
    this.actionPromise = null;
  }

  async activate(user: UserType) {
    const confirmed = await this.platformUtilsService.showDialog(
      this.activateWarningMessage(),
      this.i18nService.t("activateUserId", this.userNamePipe.transform(user)),
      this.i18nService.t("activate"),
      this.i18nService.t("cancel"),
      "warning"
    );

    if (!confirmed) {
      return false;
    }

    this.actionPromise = this.activateUser(user.id);
    try {
      await this.actionPromise;
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("activatedUserId", this.userNamePipe.transform(user))
      );
      await this.load();
    } catch (e) {
      this.validationService.showError(e);
    }
    this.actionPromise = null;
  }

  async reinvite(user: UserType) {
    if (this.actionPromise != null) {
      return;
    }

    this.actionPromise = this.reinviteUser(user.id);
    try {
      await this.actionPromise;
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("hasBeenReinvited", this.userNamePipe.transform(user))
      );
    } catch (e) {
      this.validationService.showError(e);
    }
    this.actionPromise = null;
  }

  async confirm(user: UserType) {
    function updateUser(self: BasePeopleComponent<UserType>) {
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
          this.i18nService.t("hasBeenConfirmed", this.userNamePipe.transform(user))
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

      const autoConfirm = await this.stateService.getAutoConfirmFingerPrints();
      if (autoConfirm == null || !autoConfirm) {
        const [modal] = await this.modalService.openViewRef(
          UserConfirmComponent,
          this.confirmModalRef,
          (comp) => {
            comp.name = this.userNamePipe.transform(user);
            comp.userId = user != null ? user.userId : null;
            comp.publicKey = publicKey;
            comp.onConfirmedUser.subscribe(async () => {
              try {
                comp.formPromise = confirmUser(publicKey);
                await comp.formPromise;
                modal.close();
              } catch (e) {
                this.logService.error(e);
              }
            });
          }
        );
        return;
      }

      try {
        const fingerprint = await this.cryptoService.getFingerprint(user.userId, publicKey.buffer);
        this.logService.info(`User's fingerprint: ${fingerprint.join("-")}`);
      } catch (e) {
        this.logService.error(e);
      }
      await confirmUser(publicKey);
    } catch (e) {
      this.logService.error(`Handled exception: ${e}`);
    }
  }

  isSearching() {
    return this.searchService.isSearchable(this.searchText);
  }

  isPaging() {
    const searching = this.isSearching();
    if (searching && this.didScroll) {
      this.resetPaging();
    }
    return !searching && this.users && this.users.length > this.pageSize;
  }

  protected deleteWarningMessage(user: UserType): string {
    return this.i18nService.t("removeUserConfirmation");
  }

  protected deactivateWarningMessage(): string {
    return this.i18nService.t("deactivateUserConfirmation");
  }

  protected activateWarningMessage(): string {
    return this.i18nService.t("activateUserConfirmation");
  }

  protected getCheckedUsers() {
    return this.users.filter((u) => (u as any).checked);
  }

  protected removeUser(user: UserType) {
    let index = this.users.indexOf(user);
    if (index > -1) {
      this.users.splice(index, 1);
      this.resetPaging();
    }
    if (this.statusMap.has(user.status)) {
      index = this.statusMap.get(user.status).indexOf(user);
      if (index > -1) {
        this.statusMap.get(user.status).splice(index, 1);
      }
    }
  }
}
