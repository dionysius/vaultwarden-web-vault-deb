import { CollectionView } from "@bitwarden/common/vault/models/view/collection.view";

export abstract class ImportCollectionServiceAbstraction {
  getAllAdminCollections: (organizationId: string) => Promise<CollectionView[]>;
}
