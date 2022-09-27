import { map, Observable } from "rxjs";

import { Utils } from "../../misc/utils";
import { Organization } from "../../models/domain/organization";
import { I18nService } from "../i18n.service";

export function canAccessToolsTab(org: Organization): boolean {
  return org.canAccessImportExport || org.canAccessReports;
}

export function canAccessSettingsTab(org: Organization): boolean {
  return org.isOwner;
}

export function canAccessManageTab(org: Organization): boolean {
  return (
    org.canCreateNewCollections ||
    org.canEditAnyCollection ||
    org.canDeleteAnyCollection ||
    org.canEditAssignedCollections ||
    org.canDeleteAssignedCollections ||
    org.canAccessEventLogs ||
    org.canManageGroups ||
    org.canManageUsers ||
    org.canManagePolicies ||
    org.canManageSso ||
    org.canManageScim
  );
}

export function canAccessOrgAdmin(org: Organization): boolean {
  return canAccessToolsTab(org) || canAccessSettingsTab(org) || canAccessManageTab(org);
}

export function getOrganizationById(id: string) {
  return map<Organization[], Organization | undefined>((orgs) => orgs.find((o) => o.id === id));
}

export function canAccessAdmin(i18nService: I18nService) {
  return map<Organization[], Organization[]>((orgs) =>
    orgs.filter(canAccessOrgAdmin).sort(Utils.getSortFunction(i18nService, "name"))
  );
}

export abstract class OrganizationService {
  organizations$: Observable<Organization[]>;

  get: (id: string) => Organization;
  getByIdentifier: (identifier: string) => Organization;
  getAll: (userId?: string) => Promise<Organization[]>;
  canManageSponsorships: () => Promise<boolean>;
  hasOrganizations: () => boolean;
}
