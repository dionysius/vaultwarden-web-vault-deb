import { Pipe, PipeTransform } from "@angular/core";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { OrganizationUserType } from "@bitwarden/common/enums/organizationUserType";

@Pipe({
  name: "userType",
})
export class UserTypePipe implements PipeTransform {
  constructor(private i18nService: I18nService) {}

  transform(value?: OrganizationUserType): string {
    if (value == null) {
      return this.i18nService.t("unknown");
    }
    switch (value) {
      case OrganizationUserType.Owner:
        return this.i18nService.t("owner");
      case OrganizationUserType.Admin:
        return this.i18nService.t("admin");
      case OrganizationUserType.User:
        return this.i18nService.t("user");
      case OrganizationUserType.Manager:
        return this.i18nService.t("manager");
      case OrganizationUserType.Custom:
        return this.i18nService.t("custom");
    }
  }
}
