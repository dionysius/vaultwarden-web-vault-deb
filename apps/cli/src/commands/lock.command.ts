import { VaultTimeoutService } from "@bitwarden/common/abstractions/vaultTimeout.service";
import { Response } from "@bitwarden/node/cli/models/response";
import { MessageResponse } from "@bitwarden/node/cli/models/response/messageResponse";

export class LockCommand {
  constructor(private vaultTimeoutService: VaultTimeoutService) {}

  async run() {
    await this.vaultTimeoutService.lock();
    process.env.BW_SESSION = null;
    const res = new MessageResponse("Your vault is locked.", null);
    return Response.success(res);
  }
}
