import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from "@angular/core";

import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ConfigServiceAbstraction } from "@bitwarden/common/platform/abstractions/config/config.service.abstraction";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";

// Replace this with a type safe lookup of the feature flag values in PM-2282
type FlagValue = boolean | number | string;

/**
 * Directive that conditionally renders the element when the feature flag is enabled and/or
 * matches the value specified by {@link appIfFeatureValue}.
 *
 * When a feature flag is not found in the config service, the element is hidden.
 */
@Directive({
  selector: "[appIfFeature]",
})
export class IfFeatureDirective implements OnInit {
  /**
   * The feature flag to check.
   */
  @Input() appIfFeature: FeatureFlag;

  /**
   * Optional value to compare against the value of the feature flag in the config service.
   * @default true
   */
  @Input() appIfFeatureValue: FlagValue = true;

  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private configService: ConfigServiceAbstraction,
    private logService: LogService
  ) {}

  async ngOnInit() {
    try {
      let flagValue: FlagValue;

      if (typeof this.appIfFeatureValue === "boolean") {
        flagValue = await this.configService.getFeatureFlagBool(this.appIfFeature);
      } else if (typeof this.appIfFeatureValue === "number") {
        flagValue = await this.configService.getFeatureFlagNumber(this.appIfFeature);
      } else if (typeof this.appIfFeatureValue === "string") {
        flagValue = await this.configService.getFeatureFlagString(this.appIfFeature);
      }

      if (this.appIfFeatureValue === flagValue) {
        if (!this.hasView) {
          this.viewContainer.createEmbeddedView(this.templateRef);
          this.hasView = true;
        }
      } else {
        this.viewContainer.clear();
        this.hasView = false;
      }
    } catch (e) {
      this.logService.error(e);
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
