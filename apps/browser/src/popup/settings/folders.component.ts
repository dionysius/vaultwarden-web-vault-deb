import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { map, Observable } from "rxjs";

import { FolderService } from "@bitwarden/common/abstractions/folder/folder.service.abstraction";
import { FolderView } from "@bitwarden/common/models/view/folderView";

@Component({
  selector: "app-folders",
  templateUrl: "folders.component.html",
})
export class FoldersComponent {
  folders$: Observable<FolderView[]>;

  constructor(private folderService: FolderService, private router: Router) {
    this.folders$ = this.folderService.folderViews$.pipe(
      map((folders) => {
        if (folders.length > 0) {
          folders = folders.slice(0, folders.length - 1);
        }

        return folders;
      })
    );
  }

  folderSelected(folder: FolderView) {
    this.router.navigate(["/edit-folder"], { queryParams: { folderId: folder.id } });
  }

  addFolder() {
    this.router.navigate(["/add-folder"]);
  }
}
