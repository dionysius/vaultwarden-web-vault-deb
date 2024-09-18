import { CommonModule, DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { SendType } from "@bitwarden/common/tools/send/enums/send-type";
import {
  SectionComponent,
  SectionHeaderComponent,
  TypographyModule,
  CardComponent,
  FormFieldModule,
  IconButtonModule,
  CheckboxModule,
  SelectModule,
} from "@bitwarden/components";

import { SendFormContainer } from "../../send-form-container";

import { BaseSendDetailsComponent } from "./base-send-details.component";
import { SendTextDetailsComponent } from "./send-text-details.component";

@Component({
  selector: "tools-send-details",
  templateUrl: "./send-details.component.html",
  standalone: true,
  imports: [
    SectionComponent,
    SectionHeaderComponent,
    TypographyModule,
    JslibModule,
    CardComponent,
    FormFieldModule,
    ReactiveFormsModule,
    SendTextDetailsComponent,
    IconButtonModule,
    CheckboxModule,
    CommonModule,
    SelectModule,
  ],
})
export class SendDetailsComponent extends BaseSendDetailsComponent implements OnInit {
  FileSendType = SendType.File;
  TextSendType = SendType.Text;

  constructor(
    protected sendFormContainer: SendFormContainer,
    protected formBuilder: FormBuilder,
    protected i18nService: I18nService,
    protected datePipe: DatePipe,
  ) {
    super(sendFormContainer, formBuilder, i18nService, datePipe);
  }

  async ngOnInit() {
    await super.ngOnInit();
  }
}
