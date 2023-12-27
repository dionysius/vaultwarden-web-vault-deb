import { Component, EventEmitter, Input, Output } from "@angular/core";

import { PlanResponse } from "@bitwarden/common/billing/models/response/plan.response";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";

@Component({
  selector: "app-change-plan",
  templateUrl: "change-plan.component.html",
})
export class ChangePlanComponent {
  @Input() organizationId: string;
  @Input() currentPlan: PlanResponse;
  @Output() onChanged = new EventEmitter();
  @Output() onCanceled = new EventEmitter();

  formPromise: Promise<any>;

  constructor(private logService: LogService) {}

  async submit() {
    try {
      this.onChanged.emit();
    } catch (e) {
      this.logService.error(e);
    }
  }

  cancel() {
    this.onCanceled.emit();
  }
}
