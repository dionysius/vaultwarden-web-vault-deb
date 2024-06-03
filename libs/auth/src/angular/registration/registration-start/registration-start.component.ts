import { CommonModule } from "@angular/common";
import { Component, EventEmitter, OnDestroy, OnInit, Output } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Subject, takeUntil } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { RegionConfig, Region } from "@bitwarden/common/platform/abstractions/environment.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import {
  AsyncActionsModule,
  ButtonModule,
  CheckboxModule,
  FormFieldModule,
  IconModule,
  LinkModule,
} from "@bitwarden/components";

import { RegistrationCheckEmailIcon } from "../../icons/registration-check-email.icon";
import { RegistrationEnvSelectorComponent } from "../registration-env-selector/registration-env-selector.component";

export enum RegistrationStartState {
  USER_DATA_ENTRY = "UserDataEntry",
  CHECK_EMAIL = "CheckEmail",
}

@Component({
  standalone: true,
  selector: "auth-registration-start",
  templateUrl: "./registration-start.component.html",
  imports: [
    CommonModule,
    ReactiveFormsModule,
    JslibModule,
    FormFieldModule,
    AsyncActionsModule,
    CheckboxModule,
    ButtonModule,
    LinkModule,
    IconModule,
    RegistrationEnvSelectorComponent,
  ],
})
export class RegistrationStartComponent implements OnInit, OnDestroy {
  @Output() registrationStartStateChange = new EventEmitter<RegistrationStartState>();

  state: RegistrationStartState = RegistrationStartState.USER_DATA_ENTRY;
  RegistrationStartState = RegistrationStartState;
  readonly Icons = { RegistrationCheckEmailIcon };

  isSelfHost = false;

  formGroup = this.formBuilder.group({
    email: ["", [Validators.required, Validators.email]],
    name: [""],
    acceptPolicies: [false, [this.acceptPoliciesValidator()]],
    selectedRegion: [null],
  });

  get email(): FormControl {
    return this.formGroup.get("email") as FormControl;
  }

  get name(): FormControl {
    return this.formGroup.get("name") as FormControl;
  }

  get acceptPolicies(): FormControl {
    return this.formGroup.get("acceptPolicies") as FormControl;
  }

  emailReadonly: boolean = false;

  showErrorSummary = false;

  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private platformUtilsService: PlatformUtilsService,
  ) {
    // TODO: this needs to update if user selects self hosted
    this.isSelfHost = platformUtilsService.isSelfHost();
  }

  async ngOnInit() {
    // Emit the initial state
    this.registrationStartStateChange.emit(this.state);

    this.listenForQueryParamChanges();
  }

  private listenForQueryParamChanges() {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((qParams) => {
      if (qParams.email != null && qParams.email.indexOf("@") > -1) {
        this.email?.setValue(qParams.email);
        this.emailReadonly = qParams.emailReadonly === "true";
      }
    });
  }

  submit = async () => {
    const valid = this.validateForm();

    if (!valid) {
      return;
    }

    // TODO: Implement registration logic

    this.state = RegistrationStartState.CHECK_EMAIL;
    this.registrationStartStateChange.emit(this.state);
  };

  handleSelectedRegionChange(region: RegionConfig | Region.SelfHosted | null) {
    this.isSelfHost = region === Region.SelfHosted;
  }

  private validateForm(): boolean {
    this.formGroup.markAllAsTouched();

    if (this.formGroup.invalid) {
      this.showErrorSummary = true;
    }

    return this.formGroup.valid;
  }

  goBack() {
    this.state = RegistrationStartState.USER_DATA_ENTRY;
    this.registrationStartStateChange.emit(this.state);
  }

  private acceptPoliciesValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const ctrlValue = control.value;

      return !ctrlValue && !this.isSelfHost ? { required: true } : null;
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
