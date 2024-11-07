import { inject, Injectable } from "@angular/core";
import { combineLatest, filter, firstValueFrom, map, switchMap } from "rxjs";

import { CollectionAdminService } from "@bitwarden/admin-console/common";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { PolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { PolicyType, OrganizationUserStatusType } from "@bitwarden/common/admin-console/enums";
import { CipherId } from "@bitwarden/common/types/guid";
import { CipherType } from "@bitwarden/common/vault/enums";
import { CipherData } from "@bitwarden/common/vault/models/data/cipher.data";
import { Cipher } from "@bitwarden/common/vault/models/domain/cipher";

import {
  CipherFormConfig,
  CipherFormConfigService,
  CipherFormMode,
} from "../../../../../../../libs/vault/src/cipher-form/abstractions/cipher-form-config.service";
import { RoutedVaultFilterService } from "../../individual-vault/vault-filter/services/routed-vault-filter.service";

/** Admin Console implementation of the `CipherFormConfigService`. */
@Injectable()
export class AdminConsoleCipherFormConfigService implements CipherFormConfigService {
  private policyService: PolicyService = inject(PolicyService);
  private organizationService: OrganizationService = inject(OrganizationService);
  private routedVaultFilterService: RoutedVaultFilterService = inject(RoutedVaultFilterService);
  private collectionAdminService: CollectionAdminService = inject(CollectionAdminService);
  private apiService: ApiService = inject(ApiService);

  private allowPersonalOwnership$ = this.policyService
    .policyAppliesToActiveUser$(PolicyType.PersonalOwnership)
    .pipe(map((p) => !p));

  private organizationId$ = this.routedVaultFilterService.filter$.pipe(
    map((filter) => filter.organizationId),
    filter((filter) => filter !== undefined),
  );

  private allOrganizations$ = this.organizationService.organizations$.pipe(
    map((orgs) => {
      return orgs.filter(
        (o) => o.isMember && o.enabled && o.status === OrganizationUserStatusType.Confirmed,
      );
    }),
  );

  private organization$ = combineLatest([this.allOrganizations$, this.organizationId$]).pipe(
    map(([orgs, orgId]) => orgs.find((o) => o.id === orgId)),
  );

  private allCollections$ = this.organization$.pipe(
    switchMap(async (org) => await this.collectionAdminService.getAll(org.id)),
  );

  async buildConfig(
    mode: CipherFormMode,
    cipherId?: CipherId,
    cipherType?: CipherType,
  ): Promise<CipherFormConfig> {
    const cipher = await this.getCipher(cipherId);
    const [organization, allowPersonalOwnership, allOrganizations, allCollections] =
      await firstValueFrom(
        combineLatest([
          this.organization$,
          this.allowPersonalOwnership$,
          this.allOrganizations$,
          this.allCollections$,
        ]),
      );

    // When cloning from within the Admin Console, all organizations should be available.
    // Otherwise only the one in context should be
    const organizations = mode === "clone" ? allOrganizations : [organization];
    // Only allow the user to assign to their personal vault when cloning and
    // the policies are enabled for it.
    const allowPersonalOwnershipOnlyForClone = mode === "clone" ? allowPersonalOwnership : false;

    return {
      mode,
      cipherType: cipher?.type ?? cipherType ?? CipherType.Login,
      admin: organization.canEditAllCiphers ?? false,
      allowPersonalOwnership: allowPersonalOwnershipOnlyForClone,
      originalCipher: cipher,
      collections: allCollections,
      organizations,
      folders: [], // folders not applicable in the admin console
      hideIndividualVaultFields: true,
      isAdminConsole: true,
    };
  }

  private async getCipher(id?: CipherId): Promise<Cipher | null> {
    if (id == null) {
      return Promise.resolve(null);
    }

    // Retrieve the cipher through the means of an admin
    const cipherResponse = await this.apiService.getCipherAdmin(id);
    cipherResponse.edit = true;

    const cipherData = new CipherData(cipherResponse);
    return new Cipher(cipherData);
  }
}
