import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

import { AvatarUpdateService } from "@bitwarden/common/abstractions/account/avatar-update.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { TokenService } from "@bitwarden/common/abstractions/token.service";
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
  isMe: boolean;

  constructor(
    private i18nService: I18nService,
    private avatarService: AvatarUpdateService,
    private tokenService: TokenService
  ) {}

  async ngOnInit(): Promise<void> {
    if (this.organizationName == null || this.organizationName === "") {
      this.organizationName = this.i18nService.t("me");
      this.isMe = true;
    }
    if (this.isMe) {
      this.color = await this.avatarService.loadColorFromState();
      if (this.color == null) {
        const userName =
          (await this.tokenService.getName()) ?? (await this.tokenService.getEmail());
        this.color = Utils.stringToColor(userName.toUpperCase());
      }
    } else {
      this.color = Utils.stringToColor(this.organizationName.toUpperCase());
    }
    this.textColor = Utils.pickTextColorBasedOnBgColor(this.color, 135, true) + "!important";
  }

  emitOnOrganizationClicked() {
    this.onOrganizationClicked.emit();
  }
}
