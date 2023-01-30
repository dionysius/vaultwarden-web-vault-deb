import { NgModule } from "@angular/core";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { CipherService } from "@bitwarden/common/abstractions/cipher.service";
import { CollectionService } from "@bitwarden/common/abstractions/collection.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { FolderService } from "@bitwarden/common/abstractions/folder/folder.service.abstraction";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { ImportApiServiceAbstraction } from "@bitwarden/common/abstractions/import/import-api.service.abstraction";
import { ImportService as ImportServiceAbstraction } from "@bitwarden/common/abstractions/import/import.service.abstraction";
import { ImportApiService } from "@bitwarden/common/services/import/import-api.service";
import { ImportService } from "@bitwarden/common/services/import/import.service";

import { LooseComponentsModule, SharedModule } from "../../../shared";

import { OrganizationExportComponent } from "./org-export.component";
import { OrganizationImportExportRoutingModule } from "./org-import-export-routing.module";
import { OrganizationImportComponent } from "./org-import.component";

@NgModule({
  imports: [SharedModule, LooseComponentsModule, OrganizationImportExportRoutingModule],
  declarations: [OrganizationImportComponent, OrganizationExportComponent],
  providers: [
    {
      provide: ImportApiServiceAbstraction,
      useClass: ImportApiService,
      deps: [ApiService],
    },
    {
      provide: ImportServiceAbstraction,
      useClass: ImportService,
      deps: [
        CipherService,
        FolderService,
        ImportApiServiceAbstraction,
        I18nService,
        CollectionService,
        CryptoService,
      ],
    },
  ],
})
export class OrganizationImportExportModule {}
