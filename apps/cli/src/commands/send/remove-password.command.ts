import { SendService } from "@bitwarden/common/abstractions/send.service";

import { Response } from "../../models/response";
import { SendResponse } from "../../models/response/send.response";

export class SendRemovePasswordCommand {
  constructor(private sendService: SendService) {}

  async run(id: string) {
    try {
      await this.sendService.removePasswordWithServer(id);

      const updatedSend = await this.sendService.get(id);
      const decSend = await updatedSend.decrypt();
      const res = new SendResponse(decSend);
      return Response.success(res);
    } catch (e) {
      return Response.error(e);
    }
  }
}
