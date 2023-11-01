import { CollectionDetailsResponse } from "../response/collection.response";

export class CollectionData {
  id: string;
  organizationId: string;
  name: string;
  externalId: string;
  readOnly: boolean;
  manage: boolean;
  hidePasswords: boolean;

  constructor(response: CollectionDetailsResponse) {
    this.id = response.id;
    this.organizationId = response.organizationId;
    this.name = response.name;
    this.externalId = response.externalId;
    this.readOnly = response.readOnly;
    this.manage = response.manage;
    this.hidePasswords = response.hidePasswords;
  }
}
