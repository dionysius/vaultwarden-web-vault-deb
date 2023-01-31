import { NgModule } from "@angular/core";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { CollectionService } from "@bitwarden/common/abstractions/collection.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { ImportApiServiceAbstraction } from "@bitwarden/common/abstractions/import/import-api.service.abstraction";
import { ImportService as ImportServiceAbstraction } from "@bitwarden/common/abstractions/import/import.service.abstraction";
import { ImportApiService } from "@bitwarden/common/services/import/import-api.service";
import { ImportService } from "@bitwarden/common/services/import/import.service";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { FolderService } from "@bitwarden/common/vault/abstractions/folder/folder.service.abstraction";

import { LooseComponentsModule, SharedModule } from "../../shared";

import { ExportComponent } from "./export.component";
import { FilePasswordPromptComponent } from "./file-password-prompt.component";
import { ImportExportRoutingModule } from "./import-export-routing.module";
import { ImportComponent } from "./import.component";

@NgModule({
  imports: [SharedModule, LooseComponentsModule, ImportExportRoutingModule],
  declarations: [ImportComponent, ExportComponent, FilePasswordPromptComponent],
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
export class ImportExportModule {}
