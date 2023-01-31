import { Organization } from "@bitwarden/common/src/models/domain/organization";
import { ITreeNodeObject } from "@bitwarden/common/src/models/domain/tree-node";
import { FolderView } from "@bitwarden/common/src/vault/models/view/folder.view";
import { CipherType } from "@bitwarden/common/vault/enums/cipher-type";

import { CollectionAdminView } from "../../../../../../app/organizations/core";

export type CipherStatus = "all" | "favorites" | "trash" | CipherType;

export type CipherTypeFilter = ITreeNodeObject & { type: CipherStatus; icon: string };
export type CollectionFilter = CollectionAdminView & {
  icon: string;
};
export type FolderFilter = FolderView & { icon: string };
export type OrganizationFilter = Organization & { icon: string; hideOptions?: boolean };
