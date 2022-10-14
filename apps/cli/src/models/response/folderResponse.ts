import { FolderWithIdExport } from "@bitwarden/common/models/export/folder-with-id.export";
import { FolderView } from "@bitwarden/common/models/view/folder.view";
import { BaseResponse } from "@bitwarden/node/cli/models/response/baseResponse";

export class FolderResponse extends FolderWithIdExport implements BaseResponse {
  object: string;

  constructor(o: FolderView) {
    super();
    this.object = "folder";
    this.build(o);
  }
}
