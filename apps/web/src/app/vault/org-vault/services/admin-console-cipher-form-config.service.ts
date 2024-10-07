import { inject, Injectable } from "@angular/core";
import { combineLatest, filter, firstValueFrom, map, switchMap } from "rxjs";

import { CollectionAdminService } from "@bitwarden/admin-console/common";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { CipherId } from "@bitwarden/common/types/guid";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
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
  private organizationService: OrganizationService = inject(OrganizationService);
  private cipherService: CipherService = inject(CipherService);
  private routedVaultFilterService: RoutedVaultFilterService = inject(RoutedVaultFilterService);
  private collectionAdminService: CollectionAdminService = inject(CollectionAdminService);
  private apiService: ApiService = inject(ApiService);

  private organizationId$ = this.routedVaultFilterService.filter$.pipe(
    map((filter) => filter.organizationId),
    filter((filter) => filter !== undefined),
  );

  private organization$ = this.organizationId$.pipe(
    switchMap((organizationId) => this.organizationService.get$(organizationId)),
  );

  private editableCollections$ = this.organization$.pipe(
    switchMap(async (org) => {
      const collections = await this.collectionAdminService.getAll(org.id);
      // Users that can edit all ciphers can implicitly add to / edit within any collection
      if (org.canEditAllCiphers) {
        return collections;
      }
      // The user is only allowed to add/edit items to assigned collections that are not readonly
      return collections.filter((c) => c.assigned && !c.readOnly);
    }),
  );

  async buildConfig(
    mode: CipherFormMode,
    cipherId?: CipherId,
    cipherType?: CipherType,
  ): Promise<CipherFormConfig> {
    const [organization, allCollections] = await firstValueFrom(
      combineLatest([this.organization$, this.editableCollections$]),
    );

    const cipher = await this.getCipher(organization, cipherId);

    const collections = allCollections.filter(
      (c) => c.organizationId === organization.id && c.assigned && !c.readOnly,
    );

    return {
      mode,
      cipherType: cipher?.type ?? cipherType ?? CipherType.Login,
      admin: organization.canEditAllCiphers ?? false,
      allowPersonalOwnership: false,
      originalCipher: cipher,
      collections,
      organizations: [organization], // only a single org is in context at a time
      folders: [], // folders not applicable in the admin console
      hideIndividualVaultFields: true,
    };
  }

  private async getCipher(organization: Organization, id?: CipherId): Promise<Cipher | null> {
    if (id == null) {
      return Promise.resolve(null);
    }

    // Check to see if the user has direct access to the cipher
    const cipherFromCipherService = await this.cipherService.get(id);

    // If the organization doesn't allow admin/owners to edit all ciphers return the cipher
    if (!organization.canEditAllCiphers && cipherFromCipherService != null) {
      return cipherFromCipherService;
    }

    // Retrieve the cipher through the means of an admin
    const cipherResponse = await this.apiService.getCipherAdmin(id);
    cipherResponse.edit = true;

    const cipherData = new CipherData(cipherResponse);
    return new Cipher(cipherData);
  }
}
