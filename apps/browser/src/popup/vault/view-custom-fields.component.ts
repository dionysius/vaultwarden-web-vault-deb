import { Component } from "@angular/core";

import { ViewCustomFieldsComponent as BaseViewCustomFieldsComponent } from "@bitwarden/angular/components/view-custom-fields.component";
import { EventService } from "@bitwarden/common/abstractions/event.service";

@Component({
  selector: "app-vault-view-custom-fields",
  templateUrl: "view-custom-fields.component.html",
})
export class ViewCustomFieldsComponent extends BaseViewCustomFieldsComponent {
  constructor(eventService: EventService) {
    super(eventService);
  }
}
