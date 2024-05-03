import { Organization } from "../../admin-console/models/domain/organization";
import { UserId } from "../../types/guid";
import { IdentityTokenResponse } from "../models/response/identity-token.response";

export abstract class KeyConnectorService {
  setMasterKeyFromUrl: (url: string, userId: UserId) => Promise<void>;
  getManagingOrganization: () => Promise<Organization>;
  getUsesKeyConnector: () => Promise<boolean>;
  migrateUser: () => Promise<void>;
  userNeedsMigration: () => Promise<boolean>;
  convertNewSsoUserToKeyConnector: (
    tokenResponse: IdentityTokenResponse,
    orgId: string,
    userId: UserId,
  ) => Promise<void>;
  setUsesKeyConnector: (enabled: boolean) => Promise<void>;
  setConvertAccountRequired: (status: boolean) => Promise<void>;
  getConvertAccountRequired: () => Promise<boolean>;
  removeConvertAccountRequired: () => Promise<void>;
}
