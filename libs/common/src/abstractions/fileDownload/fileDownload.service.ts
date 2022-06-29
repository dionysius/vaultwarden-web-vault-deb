import { FileDownloadRequest } from "./fileDownloadRequest";

export abstract class FileDownloadService {
  download: (request: FileDownloadRequest) => void;
}
