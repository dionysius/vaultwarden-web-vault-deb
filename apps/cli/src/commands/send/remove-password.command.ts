import { SendApiService } from "@bitwarden/common/abstractions/send/send-api.service.abstraction";
import { SendService } from "@bitwarden/common/abstractions/send/send.service.abstraction";

import { Response } from "../../models/response";
import { SendResponse } from "../../models/response/send.response";

export class SendRemovePasswordCommand {
  constructor(private sendService: SendService, private sendApiService: SendApiService) {}

  async run(id: string) {
    try {
      await this.sendApiService.removePassword(id);

      const updatedSend = await this.sendService.get(id);
      const decSend = await updatedSend.decrypt();
      const res = new SendResponse(decSend);
      return Response.success(res);
    } catch (e) {
      return Response.error(e);
    }
  }
}
