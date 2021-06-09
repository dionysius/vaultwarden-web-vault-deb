import { Component } from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { FolderService } from 'jslib-common/abstractions/folder.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';

import {
    FolderAddEditComponent as BaseFolderAddEditComponent,
} from 'jslib-angular/components/folder-add-edit.component';

@Component({
    selector: 'app-folder-add-edit',
    templateUrl: 'folder-add-edit.component.html',
})
export class FolderAddEditComponent extends BaseFolderAddEditComponent {
    constructor(folderService: FolderService, i18nService: I18nService,
        platformUtilsService: PlatformUtilsService, private router: Router,
        private route: ActivatedRoute) {
        super(folderService, i18nService, platformUtilsService);
    }

    async ngOnInit() {
        const queryParamsSub = this.route.queryParams.subscribe(async params => {
            if (params.folderId) {
                this.folderId = params.folderId;
            }
            await this.init();
            if (queryParamsSub != null) {
                queryParamsSub.unsubscribe();
            }
        });
    }

    async submit(): Promise<boolean> {
        if (await super.submit()) {
            this.router.navigate(['/folders']);
            return true;
        }

        return false;
    }

    async delete(): Promise<boolean> {
        const confirmed = await super.delete();
        if (confirmed) {
            this.router.navigate(['/folders']);
        }
        return confirmed;
    }
}
