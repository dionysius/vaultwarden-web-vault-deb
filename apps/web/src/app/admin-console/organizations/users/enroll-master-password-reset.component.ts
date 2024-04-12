import { UserVerificationDialogComponent } from "@bitwarden/auth/angular";
import { OrganizationUserService } from "@bitwarden/common/admin-console/abstractions/organization-user/organization-user.service";
import { OrganizationUserResetPasswordEnrollmentRequest } from "@bitwarden/common/admin-console/abstractions/organization-user/requests";
import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { SyncService } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";
import { DialogService } from "@bitwarden/components";

import { OrganizationUserResetPasswordService } from "../members/services/organization-user-reset-password/organization-user-reset-password.service";

interface EnrollMasterPasswordResetData {
  organization: Organization;
}

export class EnrollMasterPasswordReset {
  constructor() {}

  static async open(
    dialogService: DialogService,
    data: EnrollMasterPasswordResetData,
    resetPasswordService: OrganizationUserResetPasswordService,
    organizationUserService: OrganizationUserService,
    platformUtilsService: PlatformUtilsService,
    i18nService: I18nService,
    syncService: SyncService,
    logService: LogService,
  ) {
    const result = await UserVerificationDialogComponent.open(dialogService, {
      title: "enrollAccountRecovery",
      calloutOptions: {
        text: "resetPasswordEnrollmentWarning",
        type: "warning",
      },
    });

    // Handle the result of the dialog based on user action and verification success
    if (result.userAction === "cancel") {
      return;
    }

    // User confirmed the dialog so check verification success
    if (!result.verificationSuccess) {
      // verification failed
      return;
    }

    // Verification succeeded
    try {
      // This object is missing most of the properties in the
      // `OrganizationUserResetPasswordEnrollmentRequest()`, but those
      // properties don't carry over to the server model anyway and are
      // never used by this flow.
      const request = new OrganizationUserResetPasswordEnrollmentRequest();
      request.resetPasswordKey = await resetPasswordService.buildRecoveryKey(data.organization.id);

      await organizationUserService.putOrganizationUserResetPasswordEnrollment(
        data.organization.id,
        data.organization.userId,
        request,
      );

      platformUtilsService.showToast("success", null, i18nService.t("enrollPasswordResetSuccess"));

      await syncService.fullSync(true);
    } catch (e) {
      logService.error(e);
    }
  }
}
