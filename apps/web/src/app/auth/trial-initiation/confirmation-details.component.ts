import { Component, Input } from "@angular/core";

@Component({
  selector: "app-trial-confirmation-details",
  templateUrl: "confirmation-details.component.html",
})
export class ConfirmationDetailsComponent {
  @Input() email: string;
  @Input() orgLabel: string;
}
