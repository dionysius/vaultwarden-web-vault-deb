import { animate, state, style, transition, trigger } from "@angular/animations";
import { ConnectedPosition } from "@angular/cdk/overlay";
import { Component, EventEmitter, OnDestroy, OnInit, Output } from "@angular/core";
import { Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";

import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ConfigServiceAbstraction } from "@bitwarden/common/platform/abstractions/config/config.service.abstraction";
import { EnvironmentService } from "@bitwarden/common/platform/abstractions/environment.service";

@Component({
  selector: "environment-selector",
  templateUrl: "environment-selector.component.html",
  animations: [
    trigger("transformPanel", [
      state(
        "void",
        style({
          opacity: 0,
        })
      ),
      transition(
        "void => open",
        animate(
          "100ms linear",
          style({
            opacity: 1,
          })
        )
      ),
      transition("* => void", animate("100ms linear", style({ opacity: 0 }))),
    ]),
  ],
})
export class EnvironmentSelectorComponent implements OnInit, OnDestroy {
  @Output() onOpenSelfHostedSettings = new EventEmitter();
  euServerFlagEnabled: boolean;
  isOpen = false;
  showingModal = false;
  selectedEnvironment: ServerEnvironment;
  ServerEnvironmentType = ServerEnvironment;
  overlayPostition: ConnectedPosition[] = [
    {
      originX: "start",
      originY: "bottom",
      overlayX: "start",
      overlayY: "top",
    },
  ];
  protected componentDestroyed$: Subject<void> = new Subject();

  constructor(
    protected environmentService: EnvironmentService,
    protected configService: ConfigServiceAbstraction,
    protected router: Router
  ) {}

  async ngOnInit() {
    this.configService.serverConfig$.pipe(takeUntil(this.componentDestroyed$)).subscribe(() => {
      this.updateEnvironmentInfo();
    });
    this.updateEnvironmentInfo();
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }

  async toggle(option: ServerEnvironment) {
    this.isOpen = !this.isOpen;
    if (option === null) {
      return;
    }
    if (option === ServerEnvironment.EU) {
      await this.environmentService.setUrls({ base: "https://vault.bitwarden.eu" });
    } else if (option === ServerEnvironment.US) {
      await this.environmentService.setUrls({ base: "https://vault.bitwarden.com" });
    } else if (option === ServerEnvironment.SelfHosted) {
      this.onOpenSelfHostedSettings.emit();
    }
    this.updateEnvironmentInfo();
  }

  async updateEnvironmentInfo() {
    this.euServerFlagEnabled = await this.configService.getFeatureFlagBool(
      FeatureFlag.DisplayEuEnvironmentFlag
    );
    const webvaultUrl = this.environmentService.getWebVaultUrl();
    if (this.environmentService.isSelfHosted()) {
      this.selectedEnvironment = ServerEnvironment.SelfHosted;
    } else if (webvaultUrl != null && webvaultUrl.includes("bitwarden.eu")) {
      this.selectedEnvironment = ServerEnvironment.EU;
    } else {
      this.selectedEnvironment = ServerEnvironment.US;
    }
  }

  close() {
    this.isOpen = false;
    this.updateEnvironmentInfo();
  }
}

enum ServerEnvironment {
  US = "US",
  EU = "EU",
  SelfHosted = "Self-hosted",
}
