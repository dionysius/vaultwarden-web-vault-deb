import { UserVerificationDialogComponent } from "@bitwarden/auth/angular";
import { OrganizationUserService } from "@bitwarden/common/admin-console/abstractions/organization-user/organization-user.service";
import { OrganizationUserResetPasswordEnrollmentRequest } from "@bitwarden/common/admin-console/abstractions/organization-user/requests";
import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { UserVerificationService } from "@bitwarden/common/auth/abstractions/user-verification/user-verification.service.abstraction";
import { VerificationWithSecret } from "@bitwarden/common/auth/types/verification";
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
    userVerificationService: UserVerificationService,
  ) {
    const result = await UserVerificationDialogComponent.open(dialogService, {
      title: "enrollAccountRecovery",
      calloutOptions: {
        text: "resetPasswordEnrollmentWarning",
        type: "warning",
      },
      verificationType: {
        type: "custom",
        verificationFn: async (secret: VerificationWithSecret) => {
          const request =
            await userVerificationService.buildRequest<OrganizationUserResetPasswordEnrollmentRequest>(
              secret,
            );
          request.resetPasswordKey = await resetPasswordService.buildRecoveryKey(
            data.organization.id,
          );

          // Process the enrollment request, which is an endpoint that is
          // gated by a server-side check of the master password hash
          await organizationUserService.putOrganizationUserResetPasswordEnrollment(
            data.organization.id,
            data.organization.userId,
            request,
          );
          return true;
        },
      },
    });

    // User canceled enrollment
    if (result.userAction === "cancel") {
      return;
    }

    // Enrollment failed
    if (!result.verificationSuccess) {
      return;
    }

    // Enrollment succeeded
    try {
      platformUtilsService.showToast("success", null, i18nService.t("enrollPasswordResetSuccess"));
      await syncService.fullSync(true);
    } catch (e) {
      logService.error(e);
    }
  }
}
