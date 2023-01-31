import { EncArrayBuffer } from "../models/domain/enc-array-buffer";
import { EncString } from "../models/domain/enc-string";
import { SendFileUploadDataResponse } from "../models/response/send-file-upload-data.response";
import { AttachmentUploadDataResponse } from "../vault/models/response/attachment-upload-data.response";

export abstract class FileUploadService {
  uploadSendFile: (
    uploadData: SendFileUploadDataResponse,
    fileName: EncString,
    encryptedFileData: EncArrayBuffer
  ) => Promise<any>;
  uploadCipherAttachment: (
    admin: boolean,
    uploadData: AttachmentUploadDataResponse,
    fileName: EncString,
    encryptedFileData: EncArrayBuffer
  ) => Promise<any>;
}
