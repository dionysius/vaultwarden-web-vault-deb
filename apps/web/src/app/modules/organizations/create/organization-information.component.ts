import { Component, EventEmitter, Input, Output } from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";

@Component({
  selector: "app-org-info",
  templateUrl: "organization-information.component.html",
})
export class OrganizationInformationComponent {
  @Input() nameOnly = false;
  @Input() createOrganization = true;
  @Input() isProvider = false;
  @Input() acceptingSponsorship = false;
  @Input() formGroup: UntypedFormGroup;
  @Output() changedBusinessOwned = new EventEmitter<void>();
}
