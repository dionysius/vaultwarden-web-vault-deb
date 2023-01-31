import { Injectable } from "@angular/core";

import { OrganizationUserService } from "@bitwarden/common/abstractions/organization-user/organization-user.service";
import {
  OrganizationUserInviteRequest,
  OrganizationUserUpdateRequest,
} from "@bitwarden/common/abstractions/organization-user/requests";
import { OrganizationUserDetailsResponse } from "@bitwarden/common/abstractions/organization-user/responses";

import { CoreOrganizationModule } from "../core-organization.module";
import { OrganizationUserAdminView } from "../views/organization-user-admin-view";

@Injectable({ providedIn: CoreOrganizationModule })
export class UserAdminService {
  constructor(private organizationUserService: OrganizationUserService) {}

  async get(
    organizationId: string,
    organizationUserId: string
  ): Promise<OrganizationUserAdminView | undefined> {
    const userResponse = await this.organizationUserService.getOrganizationUser(
      organizationId,
      organizationUserId,
      {
        includeGroups: true,
      }
    );

    if (userResponse == null) {
      return undefined;
    }

    const [view] = await this.decryptMany(organizationId, [userResponse]);

    return view;
  }

  async save(user: OrganizationUserAdminView): Promise<void> {
    const request = new OrganizationUserUpdateRequest();
    request.accessAll = user.accessAll;
    request.permissions = user.permissions;
    request.type = user.type;
    request.collections = user.collections;
    request.groups = user.groups;
    request.accessSecretsManager = user.accessSecretsManager;

    await this.organizationUserService.putOrganizationUser(user.organizationId, user.id, request);
  }

  async invite(emails: string[], user: OrganizationUserAdminView): Promise<void> {
    const request = new OrganizationUserInviteRequest();
    request.emails = emails;
    request.accessAll = user.accessAll;
    request.permissions = user.permissions;
    request.type = user.type;
    request.collections = user.collections;
    request.groups = user.groups;
    request.accessSecretsManager = user.accessSecretsManager;

    await this.organizationUserService.postOrganizationUserInvite(user.organizationId, request);
  }

  private async decryptMany(
    organizationId: string,
    users: OrganizationUserDetailsResponse[]
  ): Promise<OrganizationUserAdminView[]> {
    const promises = users.map(async (u) => {
      const view = new OrganizationUserAdminView();

      view.id = u.id;
      view.organizationId = organizationId;
      view.userId = u.userId;
      view.type = u.type;
      view.status = u.status;
      view.accessAll = u.accessAll;
      view.permissions = u.permissions;
      view.resetPasswordEnrolled = u.resetPasswordEnrolled;
      view.collections = u.collections.map((c) => ({
        id: c.id,
        hidePasswords: c.hidePasswords,
        readOnly: c.readOnly,
      }));
      view.groups = u.groups;
      view.accessSecretsManager = u.accessSecretsManager;

      return view;
    });

    return await Promise.all(promises);
  }
}
