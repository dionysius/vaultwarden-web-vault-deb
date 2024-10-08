import { CollectionView } from "@bitwarden/admin-console/common";

export abstract class ImportCollectionServiceAbstraction {
  getAllAdminCollections: (organizationId: string) => Promise<CollectionView[]>;
}
