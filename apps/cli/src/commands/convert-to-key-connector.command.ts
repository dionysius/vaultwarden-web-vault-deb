import * as inquirer from "inquirer";

import { EnvironmentService } from "@bitwarden/common/abstractions/environment.service";
import { KeyConnectorService } from "@bitwarden/common/abstractions/keyConnector.service";
import { OrganizationApiServiceAbstraction } from "@bitwarden/common/abstractions/organization/organization-api.service.abstraction";
import { SyncService } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";

import { Response } from "../models/response";
import { MessageResponse } from "../models/response/message.response";

export class ConvertToKeyConnectorCommand {
  constructor(
    private keyConnectorService: KeyConnectorService,
    private environmentService: EnvironmentService,
    private syncService: SyncService,
    private organizationApiService: OrganizationApiServiceAbstraction,
    private logout: () => Promise<void>
  ) {}

  async run(): Promise<Response> {
    // If no interaction available, alert user to use web vault
    const canInteract = process.env.BW_NOINTERACTION !== "true";
    if (!canInteract) {
      await this.logout();
      return Response.error(
        new MessageResponse(
          "An organization you are a member of is using Key Connector. " +
            "In order to access the vault, you must opt-in to Key Connector now via the web vault. You have been logged out.",
          null
        )
      );
    }

    const organization = await this.keyConnectorService.getManagingOrganization();

    const answer: inquirer.Answers = await inquirer.createPromptModule({ output: process.stderr })({
      type: "list",
      name: "convert",
      message:
        organization.name +
        " is using a self-hosted key server. A master password is no longer required to log in for members of this organization. ",
      choices: [
        {
          name: "Remove master password and unlock",
          value: "remove",
        },
        {
          name: "Leave organization and unlock",
          value: "leave",
        },
        {
          name: "Log out",
          value: "exit",
        },
      ],
    });

    if (answer.convert === "remove") {
      try {
        await this.keyConnectorService.migrateUser();
      } catch (e) {
        await this.logout();
        throw e;
      }

      await this.keyConnectorService.removeConvertAccountRequired();
      await this.keyConnectorService.setUsesKeyConnector(true);

      // Update environment URL - required for api key login
      const urls = this.environmentService.getUrls();
      urls.keyConnector = organization.keyConnectorUrl;
      await this.environmentService.setUrls(urls);

      return Response.success();
    } else if (answer.convert === "leave") {
      await this.organizationApiService.leave(organization.id);
      await this.keyConnectorService.removeConvertAccountRequired();
      return Response.success();
    } else {
      await this.logout();
      return Response.error("You have been logged out.");
    }
  }
}
