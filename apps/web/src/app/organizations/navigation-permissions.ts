import { Organization } from "@bitwarden/common/models/domain/organization";

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
