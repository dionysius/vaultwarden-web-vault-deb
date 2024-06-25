import { firstValueFrom } from "rxjs";

import { Response } from "@bitwarden/cli/models/response";
import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { Utils } from "@bitwarden/common/platform/misc/utils";

import { OrganizationAuthRequestService } from "../../../../bit-common/src/admin-console/auth-requests";
import { ServiceContainer } from "../../service-container";

export class DenyCommand {
  constructor(
    private organizationService: OrganizationService,
    private organizationAuthRequestService: OrganizationAuthRequestService,
  ) {}

  async run(organizationId: string, id: string): Promise<Response> {
    if (organizationId != null) {
      organizationId = organizationId.toLowerCase();
    }

    if (!Utils.isGuid(organizationId)) {
      return Response.badRequest("`" + organizationId + "` is not a GUID.");
    }

    if (id != null) {
      id = id.toLowerCase();
    }

    if (!Utils.isGuid(id)) {
      return Response.badRequest("`" + id + "` is not a GUID.");
    }

    const organization = await firstValueFrom(this.organizationService.get$(organizationId));
    if (!organization?.canManageUsersPassword) {
      return Response.error(
        "You do not have permission to approve pending device authorization requests.",
      );
    }

    try {
      await this.organizationAuthRequestService.denyPendingRequest(organizationId, id);
      return Response.success();
    } catch (error) {
      if (error?.statusCode === 404) {
        return Response.error(
          "The request id is invalid or you do not have permission to update it.",
        );
      }

      return Response.error(error);
    }
  }

  static create(serviceContainer: ServiceContainer) {
    return new DenyCommand(
      serviceContainer.organizationService,
      serviceContainer.organizationAuthRequestService,
    );
  }
}
