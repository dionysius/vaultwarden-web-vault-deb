import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

export type LayoutVariant = "primary" | "secondary";

@Component({
  selector: "bit-layout",
  templateUrl: "layout.component.html",
  standalone: true,
  imports: [CommonModule],
})
export class LayoutComponent {
  @Input() variant: LayoutVariant = "primary";
}
