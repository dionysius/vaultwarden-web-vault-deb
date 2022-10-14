import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { CollectionService } from "@bitwarden/common/abstractions/collection.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { OrganizationUserStatusType } from "@bitwarden/common/enums/organizationUserStatusType";
import { OrganizationUserType } from "@bitwarden/common/enums/organizationUserType";
import { PermissionsApi } from "@bitwarden/common/models/api/permissions.api";
import { CollectionData } from "@bitwarden/common/models/data/collection.data";
import { Collection } from "@bitwarden/common/models/domain/collection";
import { OrganizationUserInviteRequest } from "@bitwarden/common/models/request/organizationUserInviteRequest";
import { OrganizationUserUpdateRequest } from "@bitwarden/common/models/request/organizationUserUpdateRequest";
import { SelectionReadOnlyRequest } from "@bitwarden/common/models/request/selectionReadOnlyRequest";
import { CollectionDetailsResponse } from "@bitwarden/common/models/response/collectionResponse";
import { CollectionView } from "@bitwarden/common/models/view/collection.view";

@Component({
  selector: "app-user-add-edit",
  templateUrl: "user-add-edit.component.html",
})
export class UserAddEditComponent implements OnInit {
  @Input() name: string;
  @Input() organizationUserId: string;
  @Input() organizationId: string;
  @Input() usesKeyConnector = false;
  @Output() onSavedUser = new EventEmitter();
  @Output() onDeletedUser = new EventEmitter();
  @Output() onRevokedUser = new EventEmitter();
  @Output() onRestoredUser = new EventEmitter();

  loading = true;
  editMode = false;
  isRevoked = false;
  title: string;
  emails: string;
  type: OrganizationUserType = OrganizationUserType.User;
  permissions = new PermissionsApi();
  showCustom = false;
  access: "all" | "selected" = "selected";
  collections: CollectionView[] = [];
  formPromise: Promise<any>;
  deletePromise: Promise<any>;
  organizationUserType = OrganizationUserType;

  manageAllCollectionsCheckboxes = [
    {
      id: "createNewCollections",
      get: () => this.permissions.createNewCollections,
      set: (v: boolean) => (this.permissions.createNewCollections = v),
    },
    {
      id: "editAnyCollection",
      get: () => this.permissions.editAnyCollection,
      set: (v: boolean) => (this.permissions.editAnyCollection = v),
    },
    {
      id: "deleteAnyCollection",
      get: () => this.permissions.deleteAnyCollection,
      set: (v: boolean) => (this.permissions.deleteAnyCollection = v),
    },
  ];

  manageAssignedCollectionsCheckboxes = [
    {
      id: "editAssignedCollections",
      get: () => this.permissions.editAssignedCollections,
      set: (v: boolean) => (this.permissions.editAssignedCollections = v),
    },
    {
      id: "deleteAssignedCollections",
      get: () => this.permissions.deleteAssignedCollections,
      set: (v: boolean) => (this.permissions.deleteAssignedCollections = v),
    },
  ];

  get customUserTypeSelected(): boolean {
    return this.type === OrganizationUserType.Custom;
  }

  constructor(
    private apiService: ApiService,
    private i18nService: I18nService,
    private collectionService: CollectionService,
    private platformUtilsService: PlatformUtilsService,
    private logService: LogService
  ) {}

  async ngOnInit() {
    this.editMode = this.loading = this.organizationUserId != null;
    await this.loadCollections();

    if (this.editMode) {
      this.editMode = true;
      this.title = this.i18nService.t("editUser");
      try {
        const user = await this.apiService.getOrganizationUser(
          this.organizationId,
          this.organizationUserId
        );
        this.access = user.accessAll ? "all" : "selected";
        this.type = user.type;
        this.isRevoked = user.status === OrganizationUserStatusType.Revoked;
        if (user.type === OrganizationUserType.Custom) {
          this.permissions = user.permissions;
        }
        if (user.collections != null && this.collections != null) {
          user.collections.forEach((s) => {
            const collection = this.collections.filter((c) => c.id === s.id);
            if (collection != null && collection.length > 0) {
              (collection[0] as any).checked = true;
              collection[0].readOnly = s.readOnly;
              collection[0].hidePasswords = s.hidePasswords;
            }
          });
        }
      } catch (e) {
        this.logService.error(e);
      }
    } else {
      this.title = this.i18nService.t("inviteUser");
    }

    this.loading = false;
  }

  async loadCollections() {
    const response = await this.apiService.getCollections(this.organizationId);
    const collections = response.data.map(
      (r) => new Collection(new CollectionData(r as CollectionDetailsResponse))
    );
    this.collections = await this.collectionService.decryptMany(collections);
  }

  check(c: CollectionView, select?: boolean) {
    (c as any).checked = select == null ? !(c as any).checked : select;
    if (!(c as any).checked) {
      c.readOnly = false;
    }
  }

  selectAll(select: boolean) {
    this.collections.forEach((c) => this.check(c, select));
  }

  setRequestPermissions(p: PermissionsApi, clearPermissions: boolean) {
    Object.assign(p, clearPermissions ? new PermissionsApi() : this.permissions);
    return p;
  }

  handleDependentPermissions() {
    // Manage Password Reset must have Manage Users enabled
    if (this.permissions.manageResetPassword && !this.permissions.manageUsers) {
      this.permissions.manageUsers = true;
      (document.getElementById("manageUsers") as HTMLInputElement).checked = true;
      this.platformUtilsService.showToast(
        "info",
        null,
        this.i18nService.t("resetPasswordManageUsers")
      );
    }
  }

  async submit() {
    let collections: SelectionReadOnlyRequest[] = null;
    if (this.access !== "all") {
      collections = this.collections
        .filter((c) => (c as any).checked)
        .map((c) => new SelectionReadOnlyRequest(c.id, !!c.readOnly, !!c.hidePasswords));
    }

    try {
      if (this.editMode) {
        const request = new OrganizationUserUpdateRequest();
        request.accessAll = this.access === "all";
        request.type = this.type;
        request.collections = collections;
        request.permissions = this.setRequestPermissions(
          request.permissions ?? new PermissionsApi(),
          request.type !== OrganizationUserType.Custom
        );
        this.formPromise = this.apiService.putOrganizationUser(
          this.organizationId,
          this.organizationUserId,
          request
        );
      } else {
        const request = new OrganizationUserInviteRequest();
        request.emails = [...new Set(this.emails.trim().split(/\s*,\s*/))];
        request.accessAll = this.access === "all";
        request.type = this.type;
        request.permissions = this.setRequestPermissions(
          request.permissions ?? new PermissionsApi(),
          request.type !== OrganizationUserType.Custom
        );
        request.collections = collections;
        this.formPromise = this.apiService.postOrganizationUserInvite(this.organizationId, request);
      }
      await this.formPromise;
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t(this.editMode ? "editedUserId" : "invitedUsers", this.name)
      );
      this.onSavedUser.emit();
    } catch (e) {
      this.logService.error(e);
    }
  }

  async delete() {
    if (!this.editMode) {
      return;
    }

    const message = this.usesKeyConnector
      ? "removeUserConfirmationKeyConnector"
      : "removeOrgUserConfirmation";
    const confirmed = await this.platformUtilsService.showDialog(
      this.i18nService.t(message),
      this.i18nService.t("removeUserIdAccess", this.name),
      this.i18nService.t("yes"),
      this.i18nService.t("no"),
      "warning"
    );
    if (!confirmed) {
      return false;
    }

    try {
      this.deletePromise = this.apiService.deleteOrganizationUser(
        this.organizationId,
        this.organizationUserId
      );
      await this.deletePromise;
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("removedUserId", this.name)
      );
      this.onDeletedUser.emit();
    } catch (e) {
      this.logService.error(e);
    }
  }

  async revoke() {
    if (!this.editMode) {
      return;
    }

    const confirmed = await this.platformUtilsService.showDialog(
      this.i18nService.t("revokeUserConfirmation"),
      this.i18nService.t("revokeUserId", this.name),
      this.i18nService.t("revokeAccess"),
      this.i18nService.t("cancel"),
      "warning"
    );
    if (!confirmed) {
      return false;
    }

    try {
      this.formPromise = this.apiService.revokeOrganizationUser(
        this.organizationId,
        this.organizationUserId
      );
      await this.formPromise;
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("revokedUserId", this.name)
      );
      this.isRevoked = true;
      this.onRevokedUser.emit();
    } catch (e) {
      this.logService.error(e);
    }
  }

  async restore() {
    if (!this.editMode) {
      return;
    }

    try {
      this.formPromise = this.apiService.restoreOrganizationUser(
        this.organizationId,
        this.organizationUserId
      );
      await this.formPromise;
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("restoredUserId", this.name)
      );
      this.isRevoked = false;
      this.onRestoredUser.emit();
    } catch (e) {
      this.logService.error(e);
    }
  }
}
