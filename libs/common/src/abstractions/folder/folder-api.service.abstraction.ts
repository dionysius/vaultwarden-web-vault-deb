import { Folder } from "../../models/domain/folder";
import { FolderResponse } from "../../models/response/folderResponse";

export class FolderApiServiceAbstraction {
  save: (folder: Folder) => Promise<any>;
  delete: (id: string) => Promise<any>;
  get: (id: string) => Promise<FolderResponse>;
}
