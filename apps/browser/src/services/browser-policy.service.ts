import { BehaviorSubject } from "rxjs";

import { Policy } from "@bitwarden/common/models/domain/policy";
import { PolicyService } from "@bitwarden/common/services/policy/policy.service";

import { browserSession, sessionSync } from "../decorators/session-sync-observable";

@browserSession
export class BrowserPolicyService extends PolicyService {
  @sessionSync({ ctor: Policy, initializeAs: "array" })
  protected _policies: BehaviorSubject<Policy[]>;
}
