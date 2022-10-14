import { BehaviorSubject } from "rxjs";

import { Folder } from "@bitwarden/common/models/domain/folder";
import { FolderView } from "@bitwarden/common/models/view/folder.view";
import { FolderService as BaseFolderService } from "@bitwarden/common/services/folder/folder.service";

import { browserSession, sessionSync } from "../../decorators/session-sync-observable";

@browserSession
export class FolderService extends BaseFolderService {
  @sessionSync({ initializer: Folder.fromJSON, initializeAsArray: true })
  protected _folders: BehaviorSubject<Folder[]>;
  @sessionSync({ initializer: FolderView.fromJSON, initializeAsArray: true })
  protected _folderViews: BehaviorSubject<FolderView[]>;
}
