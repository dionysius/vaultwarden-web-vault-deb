import { FolderResponse } from "../response/folder.response";

export class FolderData {
  id: string;
  name: string;
  revisionDate: string;

  constructor(response: FolderResponse) {
    this.name = response.name;
    this.id = response.id;
    this.revisionDate = response.revisionDate;
  }
}
