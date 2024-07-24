import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import {
  IconButtonModule,
  CardComponent,
  InputModule,
  SectionComponent,
  SectionHeaderComponent,
  TypographyModule,
  FormFieldModule,
} from "@bitwarden/components";

@Component({
  selector: "app-additional-information",
  templateUrl: "additional-information.component.html",
  standalone: true,
  imports: [
    CommonModule,
    JslibModule,
    CardComponent,
    IconButtonModule,
    InputModule,
    SectionComponent,
    SectionHeaderComponent,
    TypographyModule,
    FormFieldModule,
  ],
})
export class AdditionalInformationComponent {
  @Input() notes: string;
}
