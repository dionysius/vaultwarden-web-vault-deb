import { FileDownloadRequest } from "./file-download.request";

export abstract class FileDownloadService {
  download: (request: FileDownloadRequest) => void;
}
