import { Injectable } from "@angular/core";

import { FileDownloadService } from "@bitwarden/common/abstractions/fileDownload/fileDownload.service";
import { FileDownloadBuilder } from "@bitwarden/common/abstractions/fileDownload/fileDownloadBuilder";
import { FileDownloadRequest } from "@bitwarden/common/abstractions/fileDownload/fileDownloadRequest";

@Injectable()
export class DesktopFileDownloadService implements FileDownloadService {
  download(request: FileDownloadRequest): void {
    const a = window.document.createElement("a");
    a.href = URL.createObjectURL(new FileDownloadBuilder(request).blob);
    a.download = request.fileName;
    a.style.position = "fixed";
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  }
}
