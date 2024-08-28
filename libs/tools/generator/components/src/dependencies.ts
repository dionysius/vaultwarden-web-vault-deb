import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { safeProvider } from "@bitwarden/angular/platform/utils/safe-provider";
import { JslibServicesModule } from "@bitwarden/angular/services/jslib-services.module";
import { PolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { StateProvider } from "@bitwarden/common/platform/state";
import {
  CardComponent,
  CheckboxModule,
  ColorPasswordModule,
  FormFieldModule,
  InputModule,
  SectionComponent,
  SectionHeaderComponent,
} from "@bitwarden/components";
import { CredentialGeneratorService } from "@bitwarden/generator-core";

/** Shared module containing generator component dependencies */
@NgModule({
  imports: [SectionComponent, SectionHeaderComponent, CardComponent],
  exports: [
    JslibModule,
    JslibServicesModule,
    FormFieldModule,
    CommonModule,
    ReactiveFormsModule,
    ColorPasswordModule,
    InputModule,
    CheckboxModule,
    SectionComponent,
    SectionHeaderComponent,
    CardComponent,
  ],
  providers: [
    safeProvider({
      provide: CredentialGeneratorService,
      useClass: CredentialGeneratorService,
      deps: [StateProvider, PolicyService],
    }),
  ],
  declarations: [],
})
export class DependenciesModule {
  constructor() {}
}
