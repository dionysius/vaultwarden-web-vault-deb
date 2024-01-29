import { Component } from "@angular/core";

import { ImportCollectionServiceAbstraction } from "@bitwarden/importer/core";
import { ImportComponent } from "@bitwarden/importer/ui";

import { SharedModule } from "../../shared";
import { CollectionAdminService } from "../../vault/core/collection-admin.service";

import { ImportCollectionAdminService } from "./import-collection-admin.service";
import { ImportWebComponent } from "./import-web.component";

@Component({
  templateUrl: "import-web.component.html",
  standalone: true,
  imports: [SharedModule, ImportComponent],
  providers: [
    {
      provide: ImportCollectionServiceAbstraction,
      useClass: ImportCollectionAdminService,
      deps: [CollectionAdminService],
    },
  ],
})
export class AdminImportComponent extends ImportWebComponent {}
