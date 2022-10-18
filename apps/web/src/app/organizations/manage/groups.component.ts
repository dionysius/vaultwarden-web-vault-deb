import { Component, OnInit, ViewChild, ViewContainerRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { first } from "rxjs/operators";

import { ModalService } from "@bitwarden/angular/services/modal.service";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { SearchService } from "@bitwarden/common/abstractions/search.service";
import { Utils } from "@bitwarden/common/misc/utils";
import { GroupResponse } from "@bitwarden/common/models/response/group.response";

import { EntityUsersComponent } from "./entity-users.component";
import { GroupAddEditComponent } from "./group-add-edit.component";

@Component({
  selector: "app-org-groups",
  templateUrl: "groups.component.html",
})
// eslint-disable-next-line rxjs-angular/prefer-takeuntil
export class GroupsComponent implements OnInit {
  @ViewChild("addEdit", { read: ViewContainerRef, static: true }) addEditModalRef: ViewContainerRef;
  @ViewChild("usersTemplate", { read: ViewContainerRef, static: true })
  usersModalRef: ViewContainerRef;

  loading = true;
  organizationId: string;
  groups: GroupResponse[];
  pagedGroups: GroupResponse[];
  searchText: string;

  protected didScroll = false;
  protected pageSize = 100;

  private pagedGroupsCount = 0;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private i18nService: I18nService,
    private modalService: ModalService,
    private platformUtilsService: PlatformUtilsService,
    private searchService: SearchService,
    private logService: LogService
  ) {}

  async ngOnInit() {
    // eslint-disable-next-line rxjs-angular/prefer-takeuntil, rxjs/no-async-subscribe
    this.route.parent.parent.params.subscribe(async (params) => {
      this.organizationId = params.organizationId;
      await this.load();
      /* eslint-disable-next-line rxjs-angular/prefer-takeuntil, rxjs/no-async-subscribe, rxjs/no-nested-subscribe */
      this.route.queryParams.pipe(first()).subscribe(async (qParams) => {
        this.searchText = qParams.search;
      });
    });
  }

  async load() {
    const response = await this.apiService.getGroups(this.organizationId);
    const groups = response.data != null && response.data.length > 0 ? response.data : [];
    groups.sort(Utils.getSortFunction(this.i18nService, "name"));
    this.groups = groups;
    this.resetPaging();
    this.loading = false;
  }

  loadMore() {
    if (!this.groups || this.groups.length <= this.pageSize) {
      return;
    }
    const pagedLength = this.pagedGroups.length;
    let pagedSize = this.pageSize;
    if (pagedLength === 0 && this.pagedGroupsCount > this.pageSize) {
      pagedSize = this.pagedGroupsCount;
    }
    if (this.groups.length > pagedLength) {
      this.pagedGroups = this.pagedGroups.concat(
        this.groups.slice(pagedLength, pagedLength + pagedSize)
      );
    }
    this.pagedGroupsCount = this.pagedGroups.length;
    this.didScroll = this.pagedGroups.length > this.pageSize;
  }

  async edit(group: GroupResponse) {
    const [modal] = await this.modalService.openViewRef(
      GroupAddEditComponent,
      this.addEditModalRef,
      (comp) => {
        comp.organizationId = this.organizationId;
        comp.groupId = group != null ? group.id : null;
        // eslint-disable-next-line rxjs-angular/prefer-takeuntil
        comp.onSavedGroup.subscribe(() => {
          modal.close();
          this.load();
        });
        // eslint-disable-next-line rxjs-angular/prefer-takeuntil
        comp.onDeletedGroup.subscribe(() => {
          modal.close();
          this.removeGroup(group);
        });
      }
    );
  }

  add() {
    this.edit(null);
  }

  async delete(group: GroupResponse) {
    const confirmed = await this.platformUtilsService.showDialog(
      this.i18nService.t("deleteGroupConfirmation"),
      group.name,
      this.i18nService.t("yes"),
      this.i18nService.t("no"),
      "warning"
    );
    if (!confirmed) {
      return false;
    }

    try {
      await this.apiService.deleteGroup(this.organizationId, group.id);
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("deletedGroupId", group.name)
      );
      this.removeGroup(group);
    } catch (e) {
      this.logService.error(e);
    }
  }

  async users(group: GroupResponse) {
    const [modal] = await this.modalService.openViewRef(
      EntityUsersComponent,
      this.usersModalRef,
      (comp) => {
        comp.organizationId = this.organizationId;
        comp.entity = "group";
        comp.entityId = group.id;
        comp.entityName = group.name;

        // eslint-disable-next-line rxjs-angular/prefer-takeuntil
        comp.onEditedUsers.subscribe(() => {
          modal.close();
        });
      }
    );
  }

  async resetPaging() {
    this.pagedGroups = [];
    this.loadMore();
  }

  isSearching() {
    return this.searchService.isSearchable(this.searchText);
  }

  isPaging() {
    const searching = this.isSearching();
    if (searching && this.didScroll) {
      this.resetPaging();
    }
    return !searching && this.groups && this.groups.length > this.pageSize;
  }

  private removeGroup(group: GroupResponse) {
    const index = this.groups.indexOf(group);
    if (index > -1) {
      this.groups.splice(index, 1);
      this.resetPaging();
    }
  }
}
