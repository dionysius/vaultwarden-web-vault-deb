import { BehaviorSubject } from "rxjs";

import { Folder } from "@bitwarden/common/vault/models/domain/folder";
import { FolderView } from "@bitwarden/common/vault/models/view/folder.view";
import { FolderService as BaseFolderService } from "@bitwarden/common/vault/services/folder/folder.service";

import { browserSession, sessionSync } from "../../decorators/session-sync-observable";

@browserSession
export class BrowserFolderService extends BaseFolderService {
  @sessionSync({ initializer: Folder.fromJSON, initializeAs: "array" })
  protected _folders: BehaviorSubject<Folder[]>;
  @sessionSync({ initializer: FolderView.fromJSON, initializeAs: "array" })
  protected _folderViews: BehaviorSubject<FolderView[]>;
}
