import { Component, EventEmitter, Input, Output } from "@angular/core";

import { LogService } from "@bitwarden/common/abstractions/log.service";
import { PlanType } from "@bitwarden/common/enums/planType";
import { ProductType } from "@bitwarden/common/enums/productType";

@Component({
  selector: "app-change-plan",
  templateUrl: "change-plan.component.html",
})
export class ChangePlanComponent {
  @Input() organizationId: string;
  @Output() onChanged = new EventEmitter();
  @Output() onCanceled = new EventEmitter();

  formPromise: Promise<any>;
  defaultUpgradePlan: PlanType = PlanType.FamiliesAnnually;
  defaultUpgradeProduct: ProductType = ProductType.Families;

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
