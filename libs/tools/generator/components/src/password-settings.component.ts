import { OnInit, Input, Output, EventEmitter, Component, OnDestroy } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { BehaviorSubject, skip, takeUntil, Subject, map } from "rxjs";

import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { UserId } from "@bitwarden/common/types/guid";
import {
  Generators,
  CredentialGeneratorService,
  PasswordGenerationOptions,
} from "@bitwarden/generator-core";

import { DependenciesModule } from "./dependencies";
import { completeOnAccountSwitch, toValidators } from "./util";

const Controls = Object.freeze({
  length: "length",
  uppercase: "uppercase",
  lowercase: "lowercase",
  numbers: "numbers",
  special: "special",
  minNumber: "minNumber",
  minSpecial: "minSpecial",
  avoidAmbiguous: "avoidAmbiguous",
});

/** Options group for passwords */
@Component({
  standalone: true,
  selector: "bit-password-settings",
  templateUrl: "password-settings.component.html",
  imports: [DependenciesModule],
})
export class PasswordSettingsComponent implements OnInit, OnDestroy {
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

  /** Binds the password component to a specific user's settings.
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
  readonly onUpdated = new EventEmitter<PasswordGenerationOptions>();

  protected settings = this.formBuilder.group({
    [Controls.length]: [Generators.Password.settings.initial.length],
    [Controls.uppercase]: [Generators.Password.settings.initial.uppercase],
    [Controls.lowercase]: [Generators.Password.settings.initial.lowercase],
    [Controls.numbers]: [Generators.Password.settings.initial.number],
    [Controls.special]: [Generators.Password.settings.initial.special],
    [Controls.minNumber]: [Generators.Password.settings.initial.minNumber],
    [Controls.minSpecial]: [Generators.Password.settings.initial.minSpecial],
    [Controls.avoidAmbiguous]: [!Generators.Password.settings.initial.ambiguous],
  });

  async ngOnInit() {
    const singleUserId$ = this.singleUserId$();
    const settings = await this.generatorService.settings(Generators.Password, { singleUserId$ });

    settings
      .pipe(
        map((settings) => {
          // interface is "avoid" while storage is "include"
          const s: any = { ...settings };
          s.avoidAmbiguous = s.ambiguous;
          delete s.ambiguous;
          return s;
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe((s) => {
        // skips reactive event emissions to break a subscription cycle
        this.settings.patchValue(s, { emitEvent: false });
      });

    // the first emission is the current value; subsequent emissions are updates
    settings.pipe(skip(1), takeUntil(this.destroyed$)).subscribe(this.onUpdated);

    ///
    this.generatorService
      .policy$(Generators.Password, { userId$: singleUserId$ })
      .pipe(takeUntil(this.destroyed$))
      .subscribe((policy) => {
        this.settings
          .get(Controls.length)
          .setValidators(toValidators(Controls.length, Generators.Password, policy));

        this.settings
          .get(Controls.minNumber)
          .setValidators(toValidators(Controls.minNumber, Generators.Password, policy));

        this.settings
          .get(Controls.minSpecial)
          .setValidators(toValidators(Controls.minSpecial, Generators.Password, policy));

        // forward word boundaries to the template (can't do it through the rx form)
        // FIXME: move the boundary logic fully into the policy evaluator
        this.minLength = policy.length?.min ?? Generators.Password.settings.constraints.length.min;
        this.maxLength = policy.length?.max ?? Generators.Password.settings.constraints.length.max;
        this.minMinNumber =
          policy.minNumber?.min ?? Generators.Password.settings.constraints.minNumber.min;
        this.maxMinNumber =
          policy.minNumber?.max ?? Generators.Password.settings.constraints.minNumber.max;
        this.minMinSpecial =
          policy.minSpecial?.min ?? Generators.Password.settings.constraints.minSpecial.min;
        this.maxMinSpecial =
          policy.minSpecial?.max ?? Generators.Password.settings.constraints.minSpecial.max;

        const toggles = [
          [Controls.length, policy.length.min < policy.length.max],
          [Controls.uppercase, !policy.policy.useUppercase],
          [Controls.lowercase, !policy.policy.useLowercase],
          [Controls.numbers, !policy.policy.useNumbers],
          [Controls.special, !policy.policy.useSpecial],
          [Controls.minNumber, policy.minNumber.min < policy.minNumber.max],
          [Controls.minSpecial, policy.minSpecial.min < policy.minSpecial.max],
        ] as [keyof typeof Controls, boolean][];

        for (const [control, enabled] of toggles) {
          this.toggleEnabled(control, enabled);
        }
      });

    // now that outputs are set up, connect inputs
    this.settings.valueChanges
      .pipe(
        map((settings) => {
          // interface is "avoid" while storage is "include"
          const s: any = { ...settings };
          s.ambiguous = s.avoidAmbiguous;
          delete s.avoidAmbiguous;
          return s;
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe(settings);
  }

  /** attribute binding for length[min] */
  protected minLength: number;

  /** attribute binding for length[max] */
  protected maxLength: number;

  /** attribute binding for minNumber[min] */
  protected minMinNumber: number;

  /** attribute binding for minNumber[max] */
  protected maxMinNumber: number;

  /** attribute binding for minSpecial[min] */
  protected minMinSpecial: number;

  /** attribute binding for minSpecial[max] */
  protected maxMinSpecial: number;

  private toggleEnabled(setting: keyof typeof Controls, enabled: boolean) {
    if (enabled) {
      this.settings.get(setting).enable();
    } else {
      this.settings.get(setting).disable();
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
