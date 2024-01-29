import { Injectable } from "@angular/core";

import { ImportCollectionServiceAbstraction } from "../../../../../../libs/importer/src/services/import-collection.service.abstraction";
import { CollectionAdminService } from "../../vault/core/collection-admin.service";
import { CollectionAdminView } from "../../vault/core/views/collection-admin.view";

@Injectable()
export class ImportCollectionAdminService implements ImportCollectionServiceAbstraction {
  constructor(private collectionAdminService: CollectionAdminService) {}

  async getAllAdminCollections(organizationId: string): Promise<CollectionAdminView[]> {
    return await this.collectionAdminService.getAll(organizationId);
  }
}
