import { CommonModule } from "@angular/common";
import { Component, DestroyRef, EventEmitter, Input, OnChanges, Output } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  combineLatest,
  map,
  merge,
  shareReplay,
  startWith,
  Subject,
  Subscription,
  switchMap,
  take,
  tap,
} from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import {
  CardComponent,
  ColorPasswordModule,
  IconButtonModule,
  ItemModule,
  SectionComponent,
  SectionHeaderComponent,
  ToggleGroupModule,
  TypographyModule,
} from "@bitwarden/components";
import { GeneratorType } from "@bitwarden/generator-core";
import {
  PasswordGenerationServiceAbstraction,
  UsernameGenerationServiceAbstraction,
} from "@bitwarden/generator-legacy";

/**
 * Renders a password or username generator UI and emits the most recently generated value.
 * Used by the cipher form to be shown in a dialog/modal when generating cipher passwords/usernames.
 */
@Component({
  selector: "vault-cipher-form-generator",
  templateUrl: "./cipher-form-generator.component.html",
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    SectionComponent,
    ToggleGroupModule,
    JslibModule,
    ItemModule,
    ColorPasswordModule,
    IconButtonModule,
    SectionHeaderComponent,
    TypographyModule,
  ],
})
export class CipherFormGeneratorComponent implements OnChanges {
  /**
   * The type of generator form to show.
   */
  @Input({ required: true })
  type: "password" | "username";

  /**
   * Emits an event when a new value is generated.
   */
  @Output()
  valueGenerated = new EventEmitter<string>();

  protected get isPassword() {
    return this.type === "password";
  }

  protected regenerateButtonTitle: string;
  protected regenerate$ = new Subject<void>();
  protected passwordTypeSubject$ = new Subject<GeneratorType>();
  /**
   * The currently generated value displayed to the user.
   * @protected
   */
  protected generatedValue: string = "";

  /**
   * The current username generation options.
   * @private
   */
  private usernameOptions$ = this.legacyUsernameGenerationService.getOptions$();

  /**
   * The current password type selected in the UI. Starts with the saved value from the service.
   * @protected
   */
  protected passwordType$ = merge(
    this.legacyPasswordGenerationService.getOptions$().pipe(
      take(1),
      map(([options]) => options.type),
    ),
    this.passwordTypeSubject$,
  ).pipe(shareReplay({ bufferSize: 1, refCount: false }));

  /**
   * The current password generation options.
   * @private
   */
  private passwordOptions$ = combineLatest([
    this.legacyPasswordGenerationService.getOptions$(),
    this.passwordType$,
  ]).pipe(
    map(([[options], type]) => {
      options.type = type;
      return options;
    }),
  );

  /**
   * Tracks the regenerate$ subscription
   * @private
   */
  private subscription: Subscription | null;

  constructor(
    private i18nService: I18nService,
    private legacyPasswordGenerationService: PasswordGenerationServiceAbstraction,
    private legacyUsernameGenerationService: UsernameGenerationServiceAbstraction,
    private destroyRef: DestroyRef,
  ) {}

  ngOnChanges() {
    this.regenerateButtonTitle = this.i18nService.t(
      this.isPassword ? "regeneratePassword" : "regenerateUsername",
    );

    // If we have a previous subscription, clear it
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    if (this.isPassword) {
      this.setupPasswordGeneration();
    } else {
      this.setupUsernameGeneration();
    }
  }

  private setupPasswordGeneration() {
    this.subscription = this.regenerate$
      .pipe(
        startWith(null),
        switchMap(() => this.passwordOptions$),
        switchMap((options) => this.legacyPasswordGenerationService.generatePassword(options)),
        tap(async (password) => {
          await this.legacyPasswordGenerationService.addHistory(password);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((password) => {
        this.generatedValue = password;
        this.valueGenerated.emit(password);
      });
  }

  private setupUsernameGeneration() {
    this.subscription = this.regenerate$
      .pipe(
        startWith(null),
        switchMap(() => this.usernameOptions$),
        switchMap((options) => this.legacyUsernameGenerationService.generateUsername(options)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((username) => {
        this.generatedValue = username;
        this.valueGenerated.emit(username);
      });
  }

  /**
   * Switch the password generation type.
   * @param value The new password generation type.
   */
  protected updatePasswordType = async (value: GeneratorType) => {
    this.passwordTypeSubject$.next(value);
  };
}
