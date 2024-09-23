import { OnInit, Input, Output, EventEmitter, Component, OnDestroy } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { BehaviorSubject, skip, takeUntil, Subject } from "rxjs";

import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { UserId } from "@bitwarden/common/types/guid";
import {
  Generators,
  CredentialGeneratorService,
  PassphraseGenerationOptions,
} from "@bitwarden/generator-core";

import { DependenciesModule } from "./dependencies";
import { completeOnAccountSwitch, toValidators } from "./util";

const Controls = Object.freeze({
  numWords: "numWords",
  includeNumber: "includeNumber",
  capitalize: "capitalize",
  wordSeparator: "wordSeparator",
});

/** Options group for passphrases */
@Component({
  standalone: true,
  selector: "tools-passphrase-settings",
  templateUrl: "passphrase-settings.component.html",
  imports: [DependenciesModule],
})
export class PassphraseSettingsComponent implements OnInit, OnDestroy {
  /** Instantiates the component
   *  @param accountService queries user availability
   *  @param generatorService settings and policy logic
   *  @param formBuilder reactive form controls
   */
  constructor(
    private formBuilder: FormBuilder,
    private generatorService: CredentialGeneratorService,
    private accountService: AccountService,
  ) {}

  /** Binds the passphrase component to a specific user's settings.
   *  When this input is not provided, the form binds to the active
   *  user
   */
  @Input()
  userId: UserId | null;

  /** When `true`, an options header is displayed by the component. Otherwise, the header is hidden. */
  @Input()
  showHeader: boolean = true;

  /** Emits settings updates and completes if the settings become unavailable.
   * @remarks this does not emit the initial settings. If you would like
   *   to receive live settings updates including the initial update,
   *   use `CredentialGeneratorService.settings$(...)` instead.
   */
  @Output()
  readonly onUpdated = new EventEmitter<PassphraseGenerationOptions>();

  protected settings = this.formBuilder.group({
    [Controls.numWords]: [Generators.Passphrase.settings.initial.numWords],
    [Controls.wordSeparator]: [Generators.Passphrase.settings.initial.wordSeparator],
    [Controls.capitalize]: [Generators.Passphrase.settings.initial.capitalize],
    [Controls.includeNumber]: [Generators.Passphrase.settings.initial.includeNumber],
  });

  async ngOnInit() {
    const singleUserId$ = this.singleUserId$();
    const settings = await this.generatorService.settings(Generators.Passphrase, { singleUserId$ });

    // skips reactive event emissions to break a subscription cycle
    settings.pipe(takeUntil(this.destroyed$)).subscribe((s) => {
      this.settings.patchValue(s, { emitEvent: false });
    });

    // the first emission is the current value; subsequent emissions are updates
    settings.pipe(skip(1), takeUntil(this.destroyed$)).subscribe(this.onUpdated);

    // dynamic policy enforcement
    this.generatorService
      .policy$(Generators.Passphrase, { userId$: singleUserId$ })
      .pipe(takeUntil(this.destroyed$))
      .subscribe(({ constraints }) => {
        this.settings
          .get(Controls.numWords)
          .setValidators(toValidators(Controls.numWords, Generators.Passphrase, constraints));

        this.settings
          .get(Controls.wordSeparator)
          .setValidators(toValidators(Controls.wordSeparator, Generators.Passphrase, constraints));

        // forward word boundaries to the template (can't do it through the rx form)
        this.minNumWords = constraints.numWords.min;
        this.maxNumWords = constraints.numWords.max;
        this.policyInEffect = constraints.policyInEffect;

        this.toggleEnabled(Controls.capitalize, !constraints.capitalize?.readonly);
        this.toggleEnabled(Controls.includeNumber, !constraints.includeNumber?.readonly);
      });

    // now that outputs are set up, connect inputs
    this.settings.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(settings);
  }

  /** attribute binding for numWords[min] */
  protected minNumWords: number;

  /** attribute binding for numWords[max] */
  protected maxNumWords: number;

  /** display binding for enterprise policy notice */
  protected policyInEffect: boolean;

  private toggleEnabled(setting: keyof typeof Controls, enabled: boolean) {
    if (enabled) {
      this.settings.get(setting).enable({ emitEvent: false });
    } else {
      this.settings.get(setting).disable({ emitEvent: false });
    }
  }

  private singleUserId$() {
    // FIXME: this branch should probably scan for the user and make sure
    // the account is unlocked
    if (this.userId) {
      return new BehaviorSubject(this.userId as UserId).asObservable();
    }

    return this.accountService.activeAccount$.pipe(
      completeOnAccountSwitch(),
      takeUntil(this.destroyed$),
    );
  }

  private readonly destroyed$ = new Subject<void>();
  ngOnDestroy(): void {
    this.destroyed$.complete();
  }
}
