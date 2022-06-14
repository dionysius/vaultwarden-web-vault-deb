import { animate, state, style, transition, trigger } from "@angular/animations";
import { ConnectedPosition, Overlay, OverlayRef } from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
import {
  Component,
  ElementRef,
  EventEmitter,
  NgZone,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from "@angular/core";
import { merge } from "rxjs";

import { VaultFilter } from "@bitwarden/angular/modules/vault-filter/models/vault-filter.model";
import { BroadcasterService } from "@bitwarden/common/abstractions/broadcaster.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { Organization } from "@bitwarden/common/models/domain/organization";

import { VaultFilterService } from "../../services/vaultFilter.service";

@Component({
  selector: "app-vault-select",
  templateUrl: "vault-select.component.html",
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
export class VaultSelectComponent implements OnInit {
  @Output() onVaultSelectionChanged = new EventEmitter();

  @ViewChild("toggleVaults", { read: ElementRef })
  buttonRef: ElementRef<HTMLButtonElement>;
  @ViewChild("vaultSelectorTemplate", { read: TemplateRef }) templateRef: TemplateRef<HTMLElement>;

  isOpen = false;
  loaded = false;
  organizations: Organization[];
  vaultFilter: VaultFilter = new VaultFilter();
  vaultFilterDisplay = "";
  enforcePersonalOwnwership = false;
  overlayPostition: ConnectedPosition[] = [
    {
      originX: "start",
      originY: "bottom",
      overlayX: "start",
      overlayY: "top",
    },
  ];

  private overlayRef: OverlayRef;

  get show() {
    return (
      (this.organizations.length > 0 && !this.enforcePersonalOwnwership) ||
      (this.organizations.length > 1 && this.enforcePersonalOwnwership)
    );
  }

  constructor(
    private vaultFilterService: VaultFilterService,
    private i18nService: I18nService,
    private ngZone: NgZone,
    private broadcasterService: BroadcasterService,
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef
  ) {}

  async ngOnInit() {
    await this.load();
    this.broadcasterService.subscribe(this.constructor.name, (message: any) => {
      this.ngZone.run(async () => {
        switch (message.command) {
          case "syncCompleted":
            await this.load();
            break;
          default:
            break;
        }
      });
    });
  }

  async load() {
    this.vaultFilter = this.vaultFilterService.getVaultFilter();
    this.organizations = (await this.vaultFilterService.buildOrganizations()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    this.enforcePersonalOwnwership =
      await this.vaultFilterService.checkForPersonalOwnershipPolicy();

    if (this.show) {
      if (this.enforcePersonalOwnwership && !this.vaultFilter.myVaultOnly) {
        this.vaultFilterService.setVaultFilter(this.organizations[0].id);
        this.vaultFilter.selectedOrganizationId = this.organizations[0].id;
        this.vaultFilterDisplay = this.organizations.find(
          (o) => o.id === this.vaultFilter.selectedOrganizationId
        ).name;
      } else if (this.vaultFilter.myVaultOnly) {
        this.vaultFilterDisplay = this.i18nService.t(this.vaultFilterService.myVault);
      } else if (this.vaultFilter.selectedOrganizationId != null) {
        this.vaultFilterDisplay = this.organizations.find(
          (o) => o.id === this.vaultFilter.selectedOrganizationId
        ).name;
      } else {
        this.vaultFilterDisplay = this.i18nService.t(this.vaultFilterService.allVaults);
      }
    }
    this.loaded = true;
  }

  openOverlay() {
    const viewPortHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    const positionStrategyBuilder = this.overlay.position();

    const positionStrategy = positionStrategyBuilder
      .flexibleConnectedTo(this.buttonRef.nativeElement)
      .withFlexibleDimensions(true)
      .withPush(true)
      .withViewportMargin(10)
      .withGrowAfterOpen(true)
      .withPositions(this.overlayPostition);

    this.overlayRef = this.overlay.create({
      hasBackdrop: false,
      positionStrategy,
      maxHeight: viewPortHeight - 160,
      backdropClass: "cdk-overlay-transparent-backdrop",
      scrollStrategy: this.overlay.scrollStrategies.close(),
    });

    const templatePortal = new TemplatePortal(this.templateRef, this.viewContainerRef);
    this.overlayRef.attach(templatePortal);
    this.isOpen = true;

    // Handle closing
    merge(
      this.overlayRef.outsidePointerEvents(),
      this.overlayRef.backdropClick(),
      this.overlayRef.detachments()
    ).subscribe(() => {
      this.close();
    });
  }

  close() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = undefined;
    }
    this.isOpen = false;
  }

  selectOrganization(organization: Organization) {
    this.vaultFilterDisplay = organization.name;
    this.vaultFilterService.setVaultFilter(organization.id);
    this.onVaultSelectionChanged.emit();
    this.close();
  }
  selectAllVaults() {
    this.vaultFilterDisplay = this.i18nService.t(this.vaultFilterService.allVaults);
    this.vaultFilterService.setVaultFilter(this.vaultFilterService.allVaults);
    this.onVaultSelectionChanged.emit();
    this.close();
  }
  selectMyVault() {
    this.vaultFilterDisplay = this.i18nService.t(this.vaultFilterService.myVault);
    this.vaultFilterService.setVaultFilter(this.vaultFilterService.myVault);
    this.onVaultSelectionChanged.emit();
    this.close();
  }
}
