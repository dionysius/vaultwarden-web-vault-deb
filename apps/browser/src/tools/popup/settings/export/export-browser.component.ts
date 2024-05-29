import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { Router, RouterLink } from "@angular/router";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { AsyncActionsModule, ButtonModule, DialogModule } from "@bitwarden/components";
import { ExportComponent } from "@bitwarden/vault-export-ui";

@Component({
  templateUrl: "export-browser.component.html",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    JslibModule,
    DialogModule,
    AsyncActionsModule,
    ButtonModule,
    ExportComponent,
  ],
})
export class ExportBrowserComponent {
  /**
   * Used to control the disabled state of the Submit button
   * Gets set indirectly by the disabled state being emitted from the sub-form when thier form gets disabled or the submit button is clicked
   */
  protected disabled = false;

  /**
   * Used to control the disabled state of the Submit button
   * Gets set indirectly by the loading state being emitted from the sub-form when their form is loading or finished loading
   */
  protected loading = false;

  constructor(private router: Router) {}

  protected async onSuccessfulExport(organizationId: string): Promise<void> {
    await this.router.navigate(["/vault-settings"]);
  }
}
