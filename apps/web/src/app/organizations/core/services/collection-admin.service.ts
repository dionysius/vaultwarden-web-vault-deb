import { Injectable } from "@angular/core";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { EncString } from "@bitwarden/common/models/domain/enc-string";
import { CollectionRequest } from "@bitwarden/common/models/request/collection.request";
import { SelectionReadOnlyRequest } from "@bitwarden/common/models/request/selection-read-only.request";
import {
  CollectionAccessDetailsResponse,
  CollectionResponse,
} from "@bitwarden/common/models/response/collection.response";

import { CoreOrganizationModule } from "../core-organization.module";
import { CollectionAdminView } from "../views/collection-admin.view";

@Injectable({ providedIn: CoreOrganizationModule })
export class CollectionAdminService {
  constructor(private apiService: ApiService, private cryptoService: CryptoService) {}

  async getAll(organizationId: string): Promise<CollectionAdminView[]> {
    const collectionResponse = await this.apiService.getManyCollectionsWithAccessDetails(
      organizationId
    );

    if (collectionResponse?.data == null || collectionResponse.data.length === 0) {
      return [];
    }

    return await this.decryptMany(organizationId, collectionResponse.data);
  }

  async get(
    organizationId: string,
    collectionId: string
  ): Promise<CollectionAdminView | undefined> {
    const collectionResponse = await this.apiService.getCollectionAccessDetails(
      organizationId,
      collectionId
    );

    if (collectionResponse == null) {
      return undefined;
    }

    const [view] = await this.decryptMany(organizationId, [collectionResponse]);

    return view;
  }

  async save(collection: CollectionAdminView): Promise<unknown> {
    const request = await this.encrypt(collection);

    let response: CollectionResponse;
    if (collection.id == null) {
      response = await this.apiService.postCollection(collection.organizationId, request);
      collection.id = response.id;
    } else {
      response = await this.apiService.putCollection(
        collection.organizationId,
        collection.id,
        request
      );
    }

    // TODO: Implement upsert when in PS-1083: Collection Service refactors
    // await this.collectionService.upsert(data);
    return;
  }

  async delete(organizationId: string, collectionId: string): Promise<void> {
    await this.apiService.deleteCollection(organizationId, collectionId);
  }

  private async decryptMany(
    organizationId: string,
    collections: CollectionResponse[] | CollectionAccessDetailsResponse[]
  ): Promise<CollectionAdminView[]> {
    const orgKey = await this.cryptoService.getOrgKey(organizationId);

    const promises = collections.map(async (c) => {
      const view = new CollectionAdminView();
      view.id = c.id;
      view.name = await this.cryptoService.decryptToUtf8(new EncString(c.name), orgKey);
      view.externalId = c.externalId;
      view.organizationId = c.organizationId;

      if (isCollectionAccessDetailsResponse(c)) {
        view.groups = c.groups;
        view.users = c.users;
        view.assigned = c.assigned;
      }

      return view;
    });

    return await Promise.all(promises);
  }

  private async encrypt(model: CollectionAdminView): Promise<CollectionRequest> {
    if (model.organizationId == null) {
      throw new Error("Collection has no organization id.");
    }
    const key = await this.cryptoService.getOrgKey(model.organizationId);
    if (key == null) {
      throw new Error("No key for this collection's organization.");
    }
    const collection = new CollectionRequest();
    collection.externalId = model.externalId;
    collection.name = (await this.cryptoService.encrypt(model.name, key)).encryptedString;
    collection.groups = model.groups.map(
      (group) => new SelectionReadOnlyRequest(group.id, group.readOnly, group.hidePasswords)
    );
    collection.users = model.users.map(
      (user) => new SelectionReadOnlyRequest(user.id, user.readOnly, user.hidePasswords)
    );
    return collection;
  }
}

function isCollectionAccessDetailsResponse(
  response: CollectionResponse | CollectionAccessDetailsResponse
): response is CollectionAccessDetailsResponse {
  const anyResponse = response as any;

  return anyResponse?.groups instanceof Array && anyResponse?.users instanceof Array;
}
