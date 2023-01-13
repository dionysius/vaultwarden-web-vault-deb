import { Injectable } from "@angular/core";

import { FileDownloadService } from "@bitwarden/common/abstractions/fileDownload/fileDownload.service";
import { FileDownloadBuilder } from "@bitwarden/common/abstractions/fileDownload/fileDownloadBuilder";
import { FileDownloadRequest } from "@bitwarden/common/abstractions/fileDownload/fileDownloadRequest";
import { Utils } from "@bitwarden/common/misc/utils";

import { BrowserApi } from "../browser/browserApi";
import { SafariApp } from "../browser/safariApp";

@Injectable()
export class BrowserFileDownloadService implements FileDownloadService {
  download(request: FileDownloadRequest): void {
    const builder = new FileDownloadBuilder(request);
    if (BrowserApi.isSafariApi) {
      let data: BlobPart = null;
      if (builder.blobOptions.type === "text/plain" && typeof request.blobData === "string") {
        data = request.blobData;
      } else {
        data = Utils.fromBufferToB64(request.blobData as ArrayBuffer);
      }
      SafariApp.sendMessageToApp(
        "downloadFile",
        JSON.stringify({
          blobData: data,
          blobOptions: request.blobOptions,
          fileName: request.fileName,
        }),
        true
      );
    } else {
      const a = window.document.createElement("a");
      a.href = URL.createObjectURL(builder.blob);
      a.download = request.fileName;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
    }
  }
}
