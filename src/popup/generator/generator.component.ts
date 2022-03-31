import { Location } from "@angular/common";
import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { GeneratorComponent as BaseGeneratorComponent } from "jslib-angular/components/generator.component";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { PasswordGenerationService } from "jslib-common/abstractions/passwordGeneration.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { UsernameGenerationService } from "jslib-common/abstractions/usernameGeneration.service";
import { CipherView } from "jslib-common/models/view/cipherView";

@Component({
  selector: "app-generator",
  templateUrl: "generator.component.html",
})
export class GeneratorComponent extends BaseGeneratorComponent {
  private addEditCipherInfo: any;
  private cipherState: CipherView;

  constructor(
    passwordGenerationService: PasswordGenerationService,
    usernameGenerationService: UsernameGenerationService,
    platformUtilsService: PlatformUtilsService,
    i18nService: I18nService,
    stateService: StateService,
    route: ActivatedRoute,
    private location: Location
  ) {
    super(
      passwordGenerationService,
      usernameGenerationService,
      platformUtilsService,
      stateService,
      i18nService,
      route,
      window
    );
  }

  async ngOnInit() {
    this.addEditCipherInfo = await this.stateService.getAddEditCipherInfo();
    if (this.addEditCipherInfo != null) {
      this.cipherState = this.addEditCipherInfo.cipher;
    }
    this.comingFromAddEdit = this.cipherState != null;
    if (this.cipherState?.login?.hasUris) {
      this.usernameWebsite = this.cipherState.login.uris[0].hostname;
    }
    await super.ngOnInit();
  }

  select() {
    super.select();
    if (this.type === "password") {
      this.cipherState.login.password = this.password;
    } else if (this.type === "username") {
      this.cipherState.login.username = this.username;
    }
    this.addEditCipherInfo.cipher = this.cipherState;
    this.stateService.setAddEditCipherInfo(this.addEditCipherInfo);
    this.close();
  }

  close() {
    this.location.back();
  }
}
