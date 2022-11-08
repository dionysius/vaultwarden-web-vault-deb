import { BehaviorSubject, concatMap, filter } from "rxjs";

import { OrganizationService as OrganizationServiceAbstraction } from "../../abstractions/organization/organization.service.abstraction";
import { StateService } from "../../abstractions/state.service";
import { SyncNotifierService } from "../../abstractions/sync/syncNotifier.service.abstraction";
import { OrganizationData } from "../../models/data/organization.data";
import { Organization } from "../../models/domain/organization";
import { isSuccessfullyCompleted } from "../../types/syncEventArgs";

export class OrganizationService implements OrganizationServiceAbstraction {
  private _organizations = new BehaviorSubject<Organization[]>([]);

  organizations$ = this._organizations.asObservable();

  constructor(
    private stateService: StateService,
    private syncNotifierService: SyncNotifierService
  ) {
    this.stateService.activeAccountUnlocked$
      .pipe(
        concatMap(async (unlocked) => {
          if (!unlocked) {
            this._organizations.next([]);
            return;
          }

          const data = await this.stateService.getOrganizations();
          this.updateObservables(data);
        })
      )
      .subscribe();

    this.syncNotifierService.sync$
      .pipe(
        filter(isSuccessfullyCompleted),
        concatMap(async ({ data }) => {
          const { profile } = data;
          const organizations: { [id: string]: OrganizationData } = {};
          profile.organizations.forEach((o) => {
            organizations[o.id] = new OrganizationData(o);
          });

          profile.providerOrganizations.forEach((o) => {
            if (organizations[o.id] == null) {
              organizations[o.id] = new OrganizationData(o);
              organizations[o.id].isProviderUser = true;
            }
          });

          await this.updateStateAndObservables(organizations);
        })
      )
      .subscribe();
  }

  async getAll(userId?: string): Promise<Organization[]> {
    const organizationsMap = await this.stateService.getOrganizations({ userId: userId });
    return Object.values(organizationsMap || {}).map((o) => new Organization(o));
  }

  async canManageSponsorships(): Promise<boolean> {
    const organizations = this._organizations.getValue();
    return organizations.some(
      (o) => o.familySponsorshipAvailable || o.familySponsorshipFriendlyName !== null
    );
  }

  hasOrganizations(): boolean {
    const organizations = this._organizations.getValue();
    return organizations.length > 0;
  }

  async upsert(organization: OrganizationData): Promise<void> {
    let organizations = await this.stateService.getOrganizations();
    if (organizations == null) {
      organizations = {};
    }

    organizations[organization.id] = organization;

    await this.updateStateAndObservables(organizations);
  }

  async delete(id: string): Promise<void> {
    const organizations = await this.stateService.getOrganizations();
    if (organizations == null) {
      return;
    }

    if (organizations[id] == null) {
      return;
    }

    delete organizations[id];
    await this.updateStateAndObservables(organizations);
  }

  get(id: string): Organization {
    const organizations = this._organizations.getValue();

    return organizations.find((organization) => organization.id === id);
  }

  /**
   * @deprecated For the CLI only
   * @param id id of the organization
   */
  async getFromState(id: string): Promise<Organization> {
    const organizationsMap = await this.stateService.getOrganizations();
    const organization = organizationsMap[id];
    if (organization == null) {
      return null;
    }

    return new Organization(organization);
  }

  getByIdentifier(identifier: string): Organization {
    const organizations = this._organizations.getValue();

    return organizations.find((organization) => organization.identifier === identifier);
  }

  private async updateStateAndObservables(organizationsMap: { [id: string]: OrganizationData }) {
    await this.stateService.setOrganizations(organizationsMap);
    this.updateObservables(organizationsMap);
  }

  private updateObservables(organizationsMap: { [id: string]: OrganizationData }) {
    const organizations = Object.values(organizationsMap || {}).map((o) => new Organization(o));
    this._organizations.next(organizations);
  }
}
