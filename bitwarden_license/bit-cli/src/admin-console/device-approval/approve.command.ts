import { Response } from "@bitwarden/cli/models/response";

export class ApproveCommand {
  constructor() {}

  async run(id: string): Promise<Response> {
    throw new Error("Not implemented");
  }
}
