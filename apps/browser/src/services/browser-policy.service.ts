import { BehaviorSubject, filter, map, Observable, switchMap, tap } from "rxjs";
import { Jsonify } from "type-fest";

import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { PolicyType } from "@bitwarden/common/enums/policyType";
import { Policy } from "@bitwarden/common/models/domain/policy";
import { PolicyService } from "@bitwarden/common/services/policy/policy.service";

import { browserSession, sessionSync } from "../decorators/session-sync-observable";

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
      })
    );
  }
}
