import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";

import { FolderAddEditComponent as BaseFolderAddEditComponent } from "@bitwarden/angular/vault/components/folder-add-edit.component";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { FolderApiServiceAbstraction } from "@bitwarden/common/vault/abstractions/folder/folder-api.service.abstraction";
import { FolderService } from "@bitwarden/common/vault/abstractions/folder/folder.service.abstraction";

@Component({
  selector: "app-folder-add-edit",
  templateUrl: "folder-add-edit.component.html",
})
// eslint-disable-next-line rxjs-angular/prefer-takeuntil
export class FolderAddEditComponent extends BaseFolderAddEditComponent {
  constructor(
    folderService: FolderService,
    folderApiService: FolderApiServiceAbstraction,
    i18nService: I18nService,
    platformUtilsService: PlatformUtilsService,
    private router: Router,
    private route: ActivatedRoute,
    logService: LogService
  ) {
    super(folderService, folderApiService, i18nService, platformUtilsService, logService);
  }

  async ngOnInit() {
    // eslint-disable-next-line rxjs-angular/prefer-takeuntil, rxjs/no-async-subscribe
    this.route.queryParams.pipe(first()).subscribe(async (params) => {
      if (params.folderId) {
        this.folderId = params.folderId;
      }
      await this.init();
    });
  }

  async submit(): Promise<boolean> {
    if (await super.submit()) {
      this.router.navigate(["/folders"]);
      return true;
    }

    return false;
  }

  async delete(): Promise<boolean> {
    const confirmed = await super.delete();
    if (confirmed) {
      this.router.navigate(["/folders"]);
    }
    return confirmed;
  }
}
