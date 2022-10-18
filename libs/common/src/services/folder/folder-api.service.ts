import { ApiService } from "../../abstractions/api.service";
import { FolderApiServiceAbstraction } from "../../abstractions/folder/folder-api.service.abstraction";
import { InternalFolderService } from "../../abstractions/folder/folder.service.abstraction";
import { FolderData } from "../../models/data/folder.data";
import { Folder } from "../../models/domain/folder";
import { FolderRequest } from "../../models/request/folder.request";
import { FolderResponse } from "../../models/response/folder.response";

export class FolderApiService implements FolderApiServiceAbstraction {
  constructor(private folderService: InternalFolderService, private apiService: ApiService) {}

  async save(folder: Folder): Promise<any> {
    const request = new FolderRequest(folder);

    let response: FolderResponse;
    if (folder.id == null) {
      response = await this.postFolder(request);
      folder.id = response.id;
    } else {
      response = await this.putFolder(folder.id, request);
    }

    const data = new FolderData(response);
    await this.folderService.upsert(data);
  }

  async delete(id: string): Promise<any> {
    await this.deleteFolder(id);
    await this.folderService.delete(id);
  }

  async get(id: string): Promise<FolderResponse> {
    const r = await this.apiService.send("GET", "/folders/" + id, null, true, true);
    return new FolderResponse(r);
  }

  private async postFolder(request: FolderRequest): Promise<FolderResponse> {
    const r = await this.apiService.send("POST", "/folders", request, true, true);
    return new FolderResponse(r);
  }

  async putFolder(id: string, request: FolderRequest): Promise<FolderResponse> {
    const r = await this.apiService.send("PUT", "/folders/" + id, request, true, true);
    return new FolderResponse(r);
  }

  private deleteFolder(id: string): Promise<any> {
    return this.apiService.send("DELETE", "/folders/" + id, null, true, false);
  }
}
