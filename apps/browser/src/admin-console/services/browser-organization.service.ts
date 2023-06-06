import { BehaviorSubject } from "rxjs";

import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { OrganizationService } from "@bitwarden/common/admin-console/services/organization/organization.service";

import { browserSession, sessionSync } from "../../platform/decorators/session-sync-observable";

@browserSession
export class BrowserOrganizationService extends OrganizationService {
  @sessionSync({ initializer: Organization.fromJSON, initializeAs: "array" })
  protected _organizations: BehaviorSubject<Organization[]>;
}
