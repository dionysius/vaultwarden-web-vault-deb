import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { Utils } from "@bitwarden/common/misc/utils";

@Component({
  selector: "app-org-badge",
  templateUrl: "organization-name-badge.component.html",
})
export class OrganizationNameBadgeComponent implements OnInit {
  @Input() organizationName: string;
  @Input() profileName: string;

  @Output() onOrganizationClicked = new EventEmitter<string>();

  color: string;
  textColor: string;

  constructor(private i18nService: I18nService) {}

  ngOnInit(): void {
    if (this.organizationName == null || this.organizationName === "") {
      this.organizationName = this.i18nService.t("me");
      this.color = Utils.stringToColor(this.profileName.toUpperCase());
    }
    if (this.color == null) {
      this.color = Utils.stringToColor(this.organizationName.toUpperCase());
    }
    this.textColor = Utils.pickTextColorBasedOnBgColor(this.color);
  }

  emitOnOrganizationClicked() {
    this.onOrganizationClicked.emit();
  }
}
