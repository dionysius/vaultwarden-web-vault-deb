import { Component } from "@angular/core";

import { FolderAddEditComponent as BaseFolderAddEditComponent } from "@bitwarden/angular/components/folder-add-edit.component";
import { FolderApiServiceAbstraction } from "@bitwarden/common/abstractions/folder/folder-api.service.abstraction";
import { FolderService } from "@bitwarden/common/abstractions/folder/folder.service.abstraction";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";

@Component({
  selector: "app-folder-add-edit",
  templateUrl: "folder-add-edit.component.html",
})
export class FolderAddEditComponent extends BaseFolderAddEditComponent {
  protected override componentName = "app-folder-add-edit";
  constructor(
    folderService: FolderService,
    folderApiService: FolderApiServiceAbstraction,
    i18nService: I18nService,
    platformUtilsService: PlatformUtilsService,
    logService: LogService
  ) {
    super(folderService, folderApiService, i18nService, platformUtilsService, logService);
  }
}
