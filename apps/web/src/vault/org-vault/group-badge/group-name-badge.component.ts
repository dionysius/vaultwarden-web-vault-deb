import { Component, Input, OnChanges } from "@angular/core";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { SelectionReadOnlyRequest } from "@bitwarden/common/models/request/selection-read-only.request";

import { GroupView } from "../../../app/organizations/core";

@Component({
  selector: "app-group-badge",
  templateUrl: "group-name-badge.component.html",
})
export class GroupNameBadgeComponent implements OnChanges {
  @Input() selectedGroups: SelectionReadOnlyRequest[];
  @Input() allGroups: GroupView[];

  protected groupNames: string[] = [];

  constructor(private i18nService: I18nService) {}

  ngOnChanges() {
    this.groupNames = this.selectedGroups
      .map((g) => {
        return this.allGroups.find((o) => o.id === g.id)?.name;
      })
      .sort(this.i18nService.collator.compare);
  }
}
