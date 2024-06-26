import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { Router, RouterLink } from "@angular/router";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { SendType } from "@bitwarden/common/tools/send/enums/send-type";
import { ButtonModule, MenuModule } from "@bitwarden/components";

@Component({
  selector: "tools-new-send-dropdown",
  templateUrl: "new-send-dropdown.component.html",
  standalone: true,
  imports: [JslibModule, CommonModule, ButtonModule, RouterLink, MenuModule],
})
export class NewSendDropdownComponent {
  sendType = SendType;

  constructor(private router: Router) {}

  newItemNavigate(type: SendType) {
    void this.router.navigate(["/add-send"], { queryParams: { type: type, isNew: true } });
  }
}
