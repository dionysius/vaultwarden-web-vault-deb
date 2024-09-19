import { CommonModule, DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { firstValueFrom } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { EnvironmentService } from "@bitwarden/common/platform/abstractions/environment.service";
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
import { SendOptionsComponent } from "../options/send-options.component";

import { BaseSendDetailsComponent } from "./base-send-details.component";
import { SendFileDetailsComponent } from "./send-file-details.component";
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
    SendFileDetailsComponent,
    SendOptionsComponent,
    IconButtonModule,
    CheckboxModule,
    CommonModule,
    SelectModule,
  ],
})
export class SendDetailsComponent extends BaseSendDetailsComponent implements OnInit {
  FileSendType = SendType.File;
  TextSendType = SendType.Text;
  sendLink: string | null = null;

  constructor(
    protected sendFormContainer: SendFormContainer,
    protected formBuilder: FormBuilder,
    protected i18nService: I18nService,
    protected datePipe: DatePipe,
    protected environmentService: EnvironmentService,
  ) {
    super(sendFormContainer, formBuilder, i18nService, datePipe);
  }

  async getSendLink() {}

  async ngOnInit() {
    await super.ngOnInit();
    if (!this.originalSendView) {
      return;
    }
    const env = await firstValueFrom(this.environmentService.environment$);
    this.sendLink =
      env.getSendUrl() + this.originalSendView.accessId + "/" + this.originalSendView.urlB64Key;
  }
}
