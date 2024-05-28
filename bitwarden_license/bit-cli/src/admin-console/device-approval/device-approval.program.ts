import { program, Command } from "commander";

import { BaseProgram } from "@bitwarden/cli/base-program";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";

import { ApproveAllCommand } from "./approve-all.command";
import { ApproveCommand } from "./approve.command";
import { DenyAllCommand } from "./deny-all.command";
import { DenyCommand } from "./deny.command";
import { ListCommand } from "./list.command";

export class DeviceApprovalProgram extends BaseProgram {
  register() {
    program.addCommand(this.deviceApprovalCommand());
  }

  private deviceApprovalCommand() {
    return new Command("device-approval")
      .description("Manage device approvals")
      .addCommand(this.listCommand())
      .addCommand(this.approveCommand())
      .addCommand(this.approveAllCommand())
      .addCommand(this.denyCommand())
      .addCommand(this.denyAllCommand());
  }

  private listCommand(): Command {
    return new Command("list")
      .description("List all pending requests for an organization")
      .argument("<organizationId>")
      .action(async (organizationId: string) => {
        await this.exitIfFeatureFlagDisabled(FeatureFlag.BulkDeviceApproval);
        await this.exitIfLocked();

        const cmd = new ListCommand();
        const response = await cmd.run(organizationId);
        this.processResponse(response);
      });
  }

  private approveCommand(): Command {
    return new Command("approve")
      .argument("<id>")
      .description("Approve a pending request")
      .action(async (id: string) => {
        await this.exitIfFeatureFlagDisabled(FeatureFlag.BulkDeviceApproval);
        await this.exitIfLocked();

        const cmd = new ApproveCommand();
        const response = await cmd.run(id);
        this.processResponse(response);
      });
  }

  private approveAllCommand(): Command {
    return new Command("approveAll")
      .description("Approve all pending requests for an organization")
      .argument("<organizationId>")
      .action(async (organizationId: string) => {
        await this.exitIfFeatureFlagDisabled(FeatureFlag.BulkDeviceApproval);
        await this.exitIfLocked();

        const cmd = new ApproveAllCommand();
        const response = await cmd.run(organizationId);
        this.processResponse(response);
      });
  }

  private denyCommand(): Command {
    return new Command("deny")
      .argument("<id>")
      .description("Deny a pending request")
      .action(async (id: string) => {
        await this.exitIfFeatureFlagDisabled(FeatureFlag.BulkDeviceApproval);
        await this.exitIfLocked();

        const cmd = new DenyCommand();
        const response = await cmd.run(id);
        this.processResponse(response);
      });
  }

  private denyAllCommand(): Command {
    return new Command("denyAll")
      .description("Deny all pending requests for an organization")
      .argument("<organizationId>")
      .action(async (organizationId: string) => {
        await this.exitIfFeatureFlagDisabled(FeatureFlag.BulkDeviceApproval);
        await this.exitIfLocked();

        const cmd = new DenyAllCommand();
        const response = await cmd.run(organizationId);
        this.processResponse(response);
      });
  }
}
