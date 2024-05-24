import { CommonModule } from "@angular/common";
import { Component, EventEmitter, OnDestroy, OnInit, Output } from "@angular/core";
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { EMPTY, Subject, from, map, of, switchMap, takeUntil, tap } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import {
  Environment,
  EnvironmentService,
  Region,
  RegionConfig,
} from "@bitwarden/common/platform/abstractions/environment.service";
import { FormFieldModule, SelectModule } from "@bitwarden/components";

@Component({
  standalone: true,
  selector: "auth-registration-env-selector",
  templateUrl: "registration-env-selector.component.html",
  imports: [CommonModule, JslibModule, ReactiveFormsModule, FormFieldModule, SelectModule],
})
export class RegistrationEnvSelectorComponent implements OnInit, OnDestroy {
  @Output() onOpenSelfHostedSettings = new EventEmitter();

  ServerEnvironmentType = Region;

  formGroup = this.formBuilder.group({
    selectedRegion: [null as RegionConfig | Region.SelfHosted | null, Validators.required],
  });

  get selectedRegion(): FormControl {
    return this.formGroup.get("selectedRegion") as FormControl;
  }

  availableRegionConfigs: RegionConfig[] = this.environmentService.availableRegions();

  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private environmentService: EnvironmentService,
  ) {}

  async ngOnInit() {
    await this.initSelectedRegionAndListenForEnvChanges();
    this.listenForSelectedRegionChanges();
  }

  private async initSelectedRegionAndListenForEnvChanges() {
    this.environmentService.environment$
      .pipe(
        map((env: Environment) => {
          const region: Region = env.getRegion();
          const regionConfig: RegionConfig = this.availableRegionConfigs.find(
            (availableRegionConfig) => availableRegionConfig.key === region,
          );

          if (regionConfig === undefined) {
            // Self hosted does not have a region config.
            return Region.SelfHosted;
          }

          return regionConfig;
        }),
        tap((selectedRegionInitialValue: RegionConfig | Region.SelfHosted) => {
          // This inits the form control with the selected region, but
          // it also sets the value to self hosted if the self hosted settings are saved successfully
          // in the client specific implementation managed by the parent component.
          // It also resets the value to the previously selected region if the self hosted
          // settings are closed without saving. We don't emit the event to avoid a loop.
          this.selectedRegion.setValue(selectedRegionInitialValue, { emitEvent: false });
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  private listenForSelectedRegionChanges() {
    this.selectedRegion.valueChanges
      .pipe(
        switchMap((selectedRegionConfig: RegionConfig | Region.SelfHosted | null) => {
          if (selectedRegionConfig === null) {
            return of(null);
          }

          if (selectedRegionConfig === Region.SelfHosted) {
            this.onOpenSelfHostedSettings.emit();
            return EMPTY;
          }

          return from(this.environmentService.setEnvironment(selectedRegionConfig.key));
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
