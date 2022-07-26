import * as fet from "node-fetch";

import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { EncArrayBuffer } from "@bitwarden/common/models/domain/encArrayBuffer";
import { SymmetricCryptoKey } from "@bitwarden/common/models/domain/symmetricCryptoKey";
import { Response } from "@bitwarden/node/cli/models/response";
import { FileResponse } from "@bitwarden/node/cli/models/response/fileResponse";

import { CliUtils } from "../utils";

export abstract class DownloadCommand {
  constructor(protected cryptoService: CryptoService) {}

  protected async saveAttachmentToFile(
    url: string,
    key: SymmetricCryptoKey,
    fileName: string,
    output?: string
  ) {
    const response = await fet.default(new fet.Request(url, { headers: { cache: "no-cache" } }));
    if (response.status !== 200) {
      return Response.error(
        "A " + response.status + " error occurred while downloading the attachment."
      );
    }

    try {
      const encBuf = await EncArrayBuffer.fromResponse(response);
      const decBuf = await this.cryptoService.decryptFromBytes(encBuf, key);
      if (process.env.BW_SERVE === "true") {
        const res = new FileResponse(Buffer.from(decBuf), fileName);
        return Response.success(res);
      } else {
        return await CliUtils.saveResultToFile(Buffer.from(decBuf), output, fileName);
      }
    } catch (e) {
      if (typeof e === "string") {
        return Response.error(e);
      } else {
        return Response.error("An error occurred while saving the attachment.");
      }
    }
  }
}
