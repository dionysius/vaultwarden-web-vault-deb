import { Component, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output } from "@angular/core";
import { BehaviorSubject, distinctUntilChanged, map, Subject, switchMap, takeUntil } from "rxjs";

import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { UserId } from "@bitwarden/common/types/guid";
import { CredentialGeneratorService, Generators, GeneratorType } from "@bitwarden/generator-core";
import { GeneratedCredential } from "@bitwarden/generator-history";

import { DependenciesModule } from "./dependencies";
import { PassphraseSettingsComponent } from "./passphrase-settings.component";
import { PasswordSettingsComponent } from "./password-settings.component";

/** Options group for passwords */
@Component({
  standalone: true,
  selector: "bit-password-generator",
  templateUrl: "password-generator.component.html",
  imports: [DependenciesModule, PasswordSettingsComponent, PassphraseSettingsComponent],
})
export class PasswordGeneratorComponent implements OnInit, OnDestroy {
  constructor(
    private generatorService: CredentialGeneratorService,
    private accountService: AccountService,
    private zone: NgZone,
  ) {}

  /** Binds the passphrase component to a specific user's settings.
   *  When this input is not provided, the form binds to the active
   *  user
   */
  @Input()
  userId: UserId | null;

  /** tracks the currently selected credential type */
  protected credentialType$ = new BehaviorSubject<GeneratorType>("password");

  /** Emits the last generated value. */
  protected readonly value$ = new BehaviorSubject<string>("");

  /** Emits when the userId changes */
  protected readonly userId$ = new BehaviorSubject<UserId>(null);

  /** Emits when a new credential is requested */
  protected readonly generate$ = new Subject<void>();

  /** Tracks changes to the selected credential type
   * @param type the new credential type
   */
  protected onCredentialTypeChanged(type: GeneratorType) {
    if (this.credentialType$.value !== type) {
      this.credentialType$.next(type);
      this.generate$.next();
    }
  }

  /** Emits credentials created from a generation request. */
  @Output()
  readonly onGenerated = new EventEmitter<GeneratedCredential>();

  async ngOnInit() {
    if (this.userId) {
      this.userId$.next(this.userId);
    } else {
      this.accountService.activeAccount$
        .pipe(
          map((acct) => acct.id),
          distinctUntilChanged(),
          takeUntil(this.destroyed),
        )
        .subscribe(this.userId$);
    }

    this.credentialType$
      .pipe(
        switchMap((type) => this.typeToGenerator$(type)),
        takeUntil(this.destroyed),
      )
      .subscribe((generated) => {
        // update subjects within the angular zone so that the
        // template bindings refresh immediately
        this.zone.run(() => {
          this.onGenerated.next(generated);
          this.value$.next(generated.credential);
        });
      });
  }

  private typeToGenerator$(type: GeneratorType) {
    const dependencies = {
      on$: this.generate$,
      userId$: this.userId$,
    };

    switch (type) {
      case "password":
        return this.generatorService.generate$(Generators.Password, dependencies);

      case "passphrase":
        return this.generatorService.generate$(Generators.Passphrase, dependencies);
      default:
        throw new Error(`Invalid generator type: "${type}"`);
    }
  }

  private readonly destroyed = new Subject<void>();
  ngOnDestroy(): void {
    // tear down subscriptions
    this.destroyed.complete();

    // finalize subjects
    this.generate$.complete();
    this.value$.complete();

    // finalize component bindings
    this.onGenerated.complete();
  }
}
