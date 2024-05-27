import { Response } from "@bitwarden/cli/models/response";

export class DenyCommand {
  constructor() {}

  async run(id: string): Promise<Response> {
    throw new Error("Not implemented");
  }
}
