import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { Router, RouterLink } from "@angular/router";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { AsyncActionsModule, ButtonModule, DialogModule } from "@bitwarden/components";
import { ImportComponent } from "@bitwarden/importer/ui";

import { FilePopoutCalloutComponent } from "../../components/file-popout-callout.component";
import { FilePopoutUtilsService } from "../../services/file-popout-utils.service";

@Component({
  templateUrl: "import-browser.component.html",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    JslibModule,
    DialogModule,
    AsyncActionsModule,
    ButtonModule,
    ImportComponent,
    FilePopoutCalloutComponent,
  ],
})
export class ImportBrowserComponent implements OnInit {
  protected disabled = false;
  protected loading = false;

  protected hideFileSelector = false;

  constructor(private router: Router, private filePopoutUtilsService: FilePopoutUtilsService) {}

  ngOnInit(): void {
    this.hideFileSelector = this.filePopoutUtilsService.showFilePopoutMessage(window);
  }

  protected async onSuccessfulImport(organizationId: string): Promise<void> {
    this.router.navigate(["/tabs/settings"]);
  }
}
