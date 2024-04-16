import { DIALOG_DATA, DialogConfig, DialogRef } from "@angular/cdk/dialog";
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import {
  catchError,
  combineLatest,
  concatMap,
  from,
  map,
  Observable,
  of,
  shareReplay,
  Subject,
  switchMap,
  takeUntil,
} from "rxjs";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { OrganizationUserService } from "@bitwarden/common/admin-console/abstractions/organization-user/organization-user.service";
import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ErrorResponse } from "@bitwarden/common/models/response/error.response";
import { ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { UserId } from "@bitwarden/common/types/guid";
import { CollectionService } from "@bitwarden/common/vault/abstractions/collection.service";
import { CollectionData } from "@bitwarden/common/vault/models/data/collection.data";
import { Collection } from "@bitwarden/common/vault/models/domain/collection";
import { CollectionDetailsResponse } from "@bitwarden/common/vault/models/response/collection.response";
import { DialogService } from "@bitwarden/components";

import { InternalGroupService as GroupService, GroupView } from "../core";
import {
  AccessItemType,
  AccessItemValue,
  AccessItemView,
  convertToPermission,
  convertToSelectionView,
  PermissionMode,
} from "../shared/components/access-selector";

/**
 * Indices for the available tabs in the dialog
 */
export enum GroupAddEditTabType {
  Info = 0,
  Members = 1,
  Collections = 2,
}

export interface GroupAddEditDialogParams {
  /**
   * ID of the organization the group belongs to
   */
  organizationId: string;

  /**
   * Optional ID of the group being modified
   */
  groupId?: string;

  /**
   * Tab to open when the dialog is open.
   * Defaults to Group Info
   */
  initialTab?: GroupAddEditTabType;
}

export enum GroupAddEditDialogResultType {
  Saved = "saved",
  Canceled = "canceled",
  Deleted = "deleted",
}

/**
 * Strongly typed helper to open a groupAddEditDialog
 * @param dialogService Instance of the dialog service that will be used to open the dialog
 * @param config Configuration for the dialog
 */
export const openGroupAddEditDialog = (
  dialogService: DialogService,
  config: DialogConfig<GroupAddEditDialogParams>,
) => {
  return dialogService.open<GroupAddEditDialogResultType, GroupAddEditDialogParams>(
    GroupAddEditComponent,
    config,
  );
};

@Component({
  selector: "app-group-add-edit",
  templateUrl: "group-add-edit.component.html",
})
export class GroupAddEditComponent implements OnInit, OnDestroy {
  protected flexibleCollectionsEnabled$ = this.organizationService
    .get$(this.organizationId)
    .pipe(map((o) => o?.flexibleCollections));

  protected PermissionMode = PermissionMode;
  protected ResultType = GroupAddEditDialogResultType;

  tabIndex: GroupAddEditTabType;
  loading = true;
  title: string;
  collections: AccessItemView[] = [];
  members: Array<AccessItemView & { userId: UserId }> = [];
  group: GroupView;

  groupForm = this.formBuilder.group({
    accessAll: [false],
    name: ["", [Validators.required, Validators.maxLength(100)]],
    externalId: this.formBuilder.control({ value: "", disabled: true }),
    members: [[] as AccessItemValue[]],
    collections: [[] as AccessItemValue[]],
  });

  get groupId(): string | undefined {
    return this.params.groupId;
  }

  get organizationId(): string {
    return this.params.organizationId;
  }

  protected get editMode(): boolean {
    return this.groupId != null;
  }

  private destroy$ = new Subject<void>();

  private get orgCollections$() {
    return from(this.apiService.getCollections(this.organizationId)).pipe(
      switchMap((response) => {
        return from(
          this.collectionService.decryptMany(
            response.data.map(
              (r) => new Collection(new CollectionData(r as CollectionDetailsResponse)),
            ),
          ),
        );
      }),
      map((collections) =>
        collections.map<AccessItemView>((c) => ({
          id: c.id,
          type: AccessItemType.Collection,
          labelName: c.name,
          listName: c.name,
        })),
      ),
    );
  }

  private get orgMembers$(): Observable<Array<AccessItemView & { userId: UserId }>> {
    return from(this.organizationUserService.getAllUsers(this.organizationId)).pipe(
      map((response) =>
        response.data.map((m) => ({
          id: m.id,
          type: AccessItemType.Member,
          email: m.email,
          role: m.type,
          listName: m.name?.length > 0 ? `${m.name} (${m.email})` : m.email,
          labelName: m.name || m.email,
          status: m.status,
          userId: m.userId as UserId,
        })),
      ),
    );
  }

  private groupDetails$: Observable<GroupView | undefined> = of(this.editMode).pipe(
    concatMap((editMode) => {
      if (!editMode) {
        return of(undefined);
      }

      return combineLatest([
        this.groupService.get(this.organizationId, this.groupId),
        this.apiService.getGroupUsers(this.organizationId, this.groupId),
      ]).pipe(
        map(([groupView, users]) => {
          groupView.members = users;
          return groupView;
        }),
        catchError((e: unknown) => {
          if (e instanceof ErrorResponse) {
            this.logService.error(e.message);
          } else {
            this.logService.error(e.toString());
          }
          return of(undefined);
        }),
      );
    }),
    shareReplay({ refCount: false }),
  );

  restrictGroupAccess$ = combineLatest([
    this.organizationService.get$(this.organizationId),
    this.configService.getFeatureFlag$(FeatureFlag.FlexibleCollectionsV1),
    this.groupDetails$,
  ]).pipe(
    map(
      ([organization, flexibleCollectionsV1Enabled, group]) =>
        // Feature flag conditionals
        flexibleCollectionsV1Enabled &&
        organization.flexibleCollections &&
        // Business logic conditionals
        !organization.allowAdminAccessToAllCollectionItems &&
        group !== undefined,
    ),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  constructor(
    @Inject(DIALOG_DATA) private params: GroupAddEditDialogParams,
    private dialogRef: DialogRef<GroupAddEditDialogResultType>,
    private apiService: ApiService,
    private organizationUserService: OrganizationUserService,
    private groupService: GroupService,
    private i18nService: I18nService,
    private collectionService: CollectionService,
    private platformUtilsService: PlatformUtilsService,
    private logService: LogService,
    private formBuilder: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef,
    private dialogService: DialogService,
    private organizationService: OrganizationService,
    private configService: ConfigService,
    private accountService: AccountService,
  ) {
    this.tabIndex = params.initialTab ?? GroupAddEditTabType.Info;
  }

  ngOnInit() {
    this.loading = true;
    this.title = this.i18nService.t(this.editMode ? "editGroup" : "newGroup");

    combineLatest([
      this.orgCollections$,
      this.orgMembers$,
      this.groupDetails$,
      this.restrictGroupAccess$,
      this.accountService.activeAccount$,
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([collections, members, group, restrictGroupAccess, activeAccount]) => {
        this.collections = collections;
        this.members = members;
        this.group = group;

        if (this.group != undefined) {
          // Must detect changes so that AccessSelector @Inputs() are aware of the latest
          // collections/members set above, otherwise no selected values will be patched below
          this.changeDetectorRef.detectChanges();

          this.groupForm.patchValue({
            name: this.group.name,
            externalId: this.group.externalId,
            accessAll: this.group.accessAll,
            members: this.group.members.map((m) => ({
              id: m,
              type: AccessItemType.Member,
            })),
            collections: this.group.collections.map((gc) => ({
              id: gc.id,
              type: AccessItemType.Collection,
              permission: convertToPermission(gc),
            })),
          });
        }

        // If the current user is not already in the group and cannot add themselves, remove them from the list
        if (restrictGroupAccess) {
          const organizationUserId = this.members.find((m) => m.userId === activeAccount.id).id;
          const isAlreadyInGroup = this.groupForm.value.members.some(
            (m) => m.id === organizationUserId,
          );

          if (!isAlreadyInGroup) {
            this.members = this.members.filter((m) => m.id !== organizationUserId);
          }
        }

        this.loading = false;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  submit = async () => {
    this.groupForm.markAllAsTouched();

    if (this.groupForm.invalid) {
      if (this.tabIndex !== GroupAddEditTabType.Info) {
        this.platformUtilsService.showToast(
          "error",
          null,
          this.i18nService.t("fieldOnTabRequiresAttention", this.i18nService.t("groupInfo")),
        );
      }
      return;
    }

    const groupView = new GroupView();
    groupView.id = this.groupId;
    groupView.organizationId = this.organizationId;

    const formValue = this.groupForm.value;
    groupView.name = formValue.name;
    groupView.accessAll = formValue.accessAll;
    groupView.members = formValue.members?.map((m) => m.id) ?? [];

    if (!groupView.accessAll) {
      groupView.collections = formValue.collections.map((c) => convertToSelectionView(c));
    }

    await this.groupService.save(groupView);

    this.platformUtilsService.showToast(
      "success",
      null,
      this.i18nService.t(this.editMode ? "editedGroupId" : "createdGroupId", formValue.name),
    );

    this.dialogRef.close(GroupAddEditDialogResultType.Saved);
  };

  delete = async () => {
    if (!this.editMode) {
      return;
    }

    const confirmed = await this.dialogService.openSimpleDialog({
      title: this.group.name,
      content: { key: "deleteGroupConfirmation" },
      type: "warning",
    });
    if (!confirmed) {
      return false;
    }

    await this.groupService.delete(this.organizationId, this.groupId);

    this.platformUtilsService.showToast(
      "success",
      null,
      this.i18nService.t("deletedGroupId", this.group.name),
    );
    this.dialogRef.close(GroupAddEditDialogResultType.Deleted);
  };
}
