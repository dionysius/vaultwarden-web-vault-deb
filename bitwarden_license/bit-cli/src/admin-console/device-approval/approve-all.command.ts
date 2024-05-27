import { Response } from "@bitwarden/cli/models/response";

export class ApproveAllCommand {
  constructor() {}

  async run(organizationId: string): Promise<Response> {
    throw new Error("Not implemented");
  }
}
