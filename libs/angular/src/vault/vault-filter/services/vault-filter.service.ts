import { Injectable } from "@angular/core";
import { firstValueFrom, from, mergeMap, Observable } from "rxjs";

import { CipherService } from "@bitwarden/common/abstractions/cipher.service";
import { CollectionService } from "@bitwarden/common/abstractions/collection.service";
import { FolderService } from "@bitwarden/common/abstractions/folder/folder.service.abstraction";
import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { PolicyService } from "@bitwarden/common/abstractions/policy/policy.service.abstraction";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { PolicyType } from "@bitwarden/common/enums/policyType";
import { ServiceUtils } from "@bitwarden/common/misc/serviceUtils";
import { Organization } from "@bitwarden/common/models/domain/organization";
import { TreeNode } from "@bitwarden/common/models/domain/tree-node";
import { CollectionView } from "@bitwarden/common/models/view/collection.view";
import { FolderView } from "@bitwarden/common/models/view/folder.view";

import { DynamicTreeNode } from "../models/dynamic-tree-node.model";

const NestingDelimiter = "/";

@Injectable()
export class VaultFilterService {
  constructor(
    protected stateService: StateService,
    protected organizationService: OrganizationService,
    protected folderService: FolderService,
    protected cipherService: CipherService,
    protected collectionService: CollectionService,
    protected policyService: PolicyService
  ) {}

  async storeCollapsedFilterNodes(collapsedFilterNodes: Set<string>): Promise<void> {
    await this.stateService.setCollapsedGroupings(Array.from(collapsedFilterNodes));
  }

  async buildCollapsedFilterNodes(): Promise<Set<string>> {
    return new Set(await this.stateService.getCollapsedGroupings());
  }

  async buildOrganizations(): Promise<Organization[]> {
    let organizations = await this.organizationService.getAll();
    if (organizations != null) {
      organizations = organizations.sort((a, b) => a.name.localeCompare(b.name));
    }

    return organizations;
  }

  buildNestedFolders(organizationId?: string): Observable<DynamicTreeNode<FolderView>> {
    const transformation = async (storedFolders: FolderView[]) => {
      let folders: FolderView[];
      if (organizationId != null) {
        const ciphers = await this.cipherService.getAllDecrypted();
        const orgCiphers = ciphers.filter((c) => c.organizationId == organizationId);
        folders = storedFolders.filter(
          (f) =>
            orgCiphers.filter((oc) => oc.folderId == f.id).length > 0 ||
            ciphers.filter((c) => c.folderId == f.id).length < 1
        );
      } else {
        folders = storedFolders;
      }
      const nestedFolders = await this.getAllFoldersNested(folders);
      return new DynamicTreeNode<FolderView>({
        fullList: folders,
        nestedList: nestedFolders,
      });
    };

    return this.folderService.folderViews$.pipe(
      mergeMap((folders) => from(transformation(folders)))
    );
  }

  async buildCollections(organizationId?: string): Promise<DynamicTreeNode<CollectionView>> {
    const storedCollections = await this.collectionService.getAllDecrypted();
    let collections: CollectionView[];
    if (organizationId != null) {
      collections = storedCollections.filter((c) => c.organizationId === organizationId);
    } else {
      collections = storedCollections;
    }
    const nestedCollections = await this.collectionService.getAllNested(collections);
    return new DynamicTreeNode<CollectionView>({
      fullList: collections,
      nestedList: nestedCollections,
    });
  }

  async checkForSingleOrganizationPolicy(): Promise<boolean> {
    return await firstValueFrom(
      this.policyService.policyAppliesToActiveUser$(PolicyType.SingleOrg)
    );
  }

  async checkForPersonalOwnershipPolicy(): Promise<boolean> {
    return await firstValueFrom(
      this.policyService.policyAppliesToActiveUser$(PolicyType.PersonalOwnership)
    );
  }

  protected async getAllFoldersNested(folders: FolderView[]): Promise<TreeNode<FolderView>[]> {
    const nodes: TreeNode<FolderView>[] = [];
    folders.forEach((f) => {
      const folderCopy = new FolderView();
      folderCopy.id = f.id;
      folderCopy.revisionDate = f.revisionDate;
      const parts = f.name != null ? f.name.replace(/^\/+|\/+$/g, "").split(NestingDelimiter) : [];
      ServiceUtils.nestedTraverse(nodes, 0, parts, folderCopy, null, NestingDelimiter);
    });
    return nodes;
  }

  async getFolderNested(id: string): Promise<TreeNode<FolderView>> {
    const folders = await this.getAllFoldersNested(
      await firstValueFrom(this.folderService.folderViews$)
    );
    return ServiceUtils.getTreeNodeObject(folders, id) as TreeNode<FolderView>;
  }
}
