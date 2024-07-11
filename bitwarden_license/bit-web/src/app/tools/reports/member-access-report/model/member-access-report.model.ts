import { EncString } from "@bitwarden/common/platform/models/domain/enc-string";

export type MemberAccessCollectionModel = {
  id: string;
  name: EncString;
  itemCount: number;
};

export type MemberAccessGroupModel = {
  id: string;
  name: string;
  itemCount: number;
  collections: MemberAccessCollectionModel[];
};

export type MemberAccessReportModel = {
  userName: string;
  email: string;
  twoFactorEnabled: boolean;
  accountRecoveryEnabled: boolean;
  collections: MemberAccessCollectionModel[];
  groups: MemberAccessGroupModel[];
};
