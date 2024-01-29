import { Component, Input } from "@angular/core";

@Component({
  selector: "app-review-blurb",
  templateUrl: "review-blurb.component.html",
})
export class ReviewBlurbComponent {
  @Input() header: string;
  @Input() quote: string;
  @Input() source: string;
}
