import { BehaviorSubject, filter, map, Observable, switchMap, tap } from "rxjs";
import { Jsonify } from "type-fest";

import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { PolicyType } from "@bitwarden/common/admin-console/enums";
import { Policy } from "@bitwarden/common/admin-console/models/domain/policy";
import { PolicyService } from "@bitwarden/common/admin-console/services/policy/policy.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";

import { browserSession, sessionSync } from "../../platform/decorators/session-sync-observable";

@browserSession
export class BrowserPolicyService extends PolicyService {
  @sessionSync({
    initializer: (obj: Jsonify<Policy>) => Object.assign(new Policy(), obj),
    initializeAs: "array",
  })
  protected _policies: BehaviorSubject<Policy[]>;

  constructor(stateService: StateService, organizationService: OrganizationService) {
    super(stateService, organizationService);
    this._policies.pipe(this.handleActivateAutofillPolicy.bind(this)).subscribe();
  }

  /**
   * If the ActivateAutofill policy is enabled, save a flag indicating if we need to
   * enable Autofill on page load.
   */
  private handleActivateAutofillPolicy(policies$: Observable<Policy[]>) {
    return policies$.pipe(
      map((policies) => policies.find((p) => p.type == PolicyType.ActivateAutofill && p.enabled)),
      filter((p) => p != null),
      switchMap(async (_) => [
        await this.stateService.getActivateAutoFillOnPageLoadFromPolicy(),
        await this.stateService.getEnableAutoFillOnPageLoad(),
      ]),
      tap(([activated, autofillEnabled]) => {
        if (activated === undefined) {
          this.stateService.setActivateAutoFillOnPageLoadFromPolicy(!autofillEnabled);
        }
      }),
    );
  }
}
