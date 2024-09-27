import { Component, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import {
  BehaviorSubject,
  distinctUntilChanged,
  filter,
  map,
  ReplaySubject,
  Subject,
  switchMap,
  takeUntil,
  withLatestFrom,
} from "rxjs";

import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { UserId } from "@bitwarden/common/types/guid";
import { Option } from "@bitwarden/components/src/select/option";
import {
  CredentialAlgorithm,
  CredentialGeneratorInfo,
  CredentialGeneratorService,
  GeneratedCredential,
  Generators,
  isEmailAlgorithm,
  isUsernameAlgorithm,
} from "@bitwarden/generator-core";

import { CatchallSettingsComponent } from "./catchall-settings.component";
import { DependenciesModule } from "./dependencies";
import { SubaddressSettingsComponent } from "./subaddress-settings.component";
import { UsernameSettingsComponent } from "./username-settings.component";
import { completeOnAccountSwitch } from "./util";

/** Component that generates usernames and emails */
@Component({
  standalone: true,
  selector: "tools-username-generator",
  templateUrl: "username-generator.component.html",
  imports: [
    DependenciesModule,
    CatchallSettingsComponent,
    SubaddressSettingsComponent,
    UsernameSettingsComponent,
  ],
})
export class UsernameGeneratorComponent implements OnInit, OnDestroy {
  /** Instantiates the username generator
   *  @param generatorService generates credentials; stores preferences
   *  @param i18nService localizes generator algorithm descriptions
   *  @param accountService discovers the active user when one is not provided
   *  @param zone detects generator settings updates originating from the generator services
   *  @param formBuilder binds reactive form
   */
  constructor(
    private generatorService: CredentialGeneratorService,
    private i18nService: I18nService,
    private accountService: AccountService,
    private zone: NgZone,
    private formBuilder: FormBuilder,
  ) {}

  /** Binds the component to a specific user's settings. When this input is not provided,
   * the form binds to the active user
   */
  @Input()
  userId: UserId | null;

  /** Emits credentials created from a generation request. */
  @Output()
  readonly onGenerated = new EventEmitter<GeneratedCredential>();

  /** Tracks the selected generation algorithm */
  protected credential = this.formBuilder.group({
    type: ["username" as CredentialAlgorithm],
  });

  async ngOnInit() {
    if (this.userId) {
      this.userId$.next(this.userId);
    } else {
      this.singleUserId$().pipe(takeUntil(this.destroyed)).subscribe(this.userId$);
    }

    this.generatorService
      .algorithms$(["email", "username"], { userId$: this.userId$ })
      .pipe(
        map((algorithms) => this.toOptions(algorithms)),
        takeUntil(this.destroyed),
      )
      .subscribe(this.typeOptions$);

    this.algorithm$
      .pipe(
        map((a) => a?.descriptionKey && this.i18nService.t(a?.descriptionKey)),
        takeUntil(this.destroyed),
      )
      .subscribe((hint) => {
        // update subjects within the angular zone so that the
        // template bindings refresh immediately
        this.zone.run(() => {
          this.credentialTypeHint$.next(hint);
        });
      });

    // wire up the generator
    this.algorithm$
      .pipe(
        switchMap((algorithm) => this.typeToGenerator$(algorithm.id)),
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

    // assume the last-visible generator algorithm is the user's preferred one
    const preferences = await this.generatorService.preferences({ singleUserId$: this.userId$ });
    this.credential.valueChanges
      .pipe(withLatestFrom(preferences), takeUntil(this.destroyed))
      .subscribe(([{ type }, preference]) => {
        if (isEmailAlgorithm(type)) {
          preference.email.algorithm = type;
          preference.email.updated = new Date();
        } else if (isUsernameAlgorithm(type)) {
          preference.username.algorithm = type;
          preference.username.updated = new Date();
        } else {
          return;
        }

        preferences.next(preference);
      });

    // populate the form with the user's preferences to kick off interactivity
    preferences.pipe(takeUntil(this.destroyed)).subscribe(({ email, username }) => {
      // this generator supports email & username; the last preference
      // set by the user "wins"
      const preference = email.updated > username.updated ? email.algorithm : username.algorithm;

      // break subscription loop
      this.credential.setValue({ type: preference }, { emitEvent: false });

      const algorithm = this.generatorService.algorithm(preference);
      // update subjects within the angular zone so that the
      // template bindings refresh immediately
      this.zone.run(() => {
        this.algorithm$.next(algorithm);
      });
    });

    // generate on load unless the generator prohibits it
    this.algorithm$
      .pipe(
        distinctUntilChanged((prev, next) => prev.id === next.id),
        filter((a) => !a.onlyOnRequest),
        takeUntil(this.destroyed),
      )
      .subscribe(() => this.generate$.next());
  }

  private typeToGenerator$(type: CredentialAlgorithm) {
    const dependencies = {
      on$: this.generate$,
      userId$: this.userId$,
    };

    switch (type) {
      case "catchall":
        return this.generatorService.generate$(Generators.catchall, dependencies);

      case "subaddress":
        return this.generatorService.generate$(Generators.subaddress, dependencies);

      case "username":
        return this.generatorService.generate$(Generators.username, dependencies);

      default:
        throw new Error(`Invalid generator type: "${type}"`);
    }
  }

  /** Lists the credential types supported by the component. */
  protected typeOptions$ = new BehaviorSubject<Option<CredentialAlgorithm>[]>([]);

  /** tracks the currently selected credential type */
  protected algorithm$ = new ReplaySubject<CredentialGeneratorInfo>(1);

  /** Emits hint key for the currently selected credential type */
  protected credentialTypeHint$ = new ReplaySubject<string>(1);

  /** Emits the last generated value. */
  protected readonly value$ = new BehaviorSubject<string>("");

  /** Emits when the userId changes */
  protected readonly userId$ = new BehaviorSubject<UserId>(null);

  /** Emits when a new credential is requested */
  protected readonly generate$ = new Subject<void>();

  private singleUserId$() {
    // FIXME: this branch should probably scan for the user and make sure
    // the account is unlocked
    if (this.userId) {
      return new BehaviorSubject(this.userId as UserId).asObservable();
    }

    return this.accountService.activeAccount$.pipe(
      completeOnAccountSwitch(),
      takeUntil(this.destroyed),
    );
  }

  private toOptions(algorithms: CredentialGeneratorInfo[]) {
    const options: Option<CredentialAlgorithm>[] = algorithms.map((algorithm) => ({
      value: algorithm.id,
      label: this.i18nService.t(algorithm.nameKey),
    }));

    return options;
  }

  private readonly destroyed = new Subject<void>();
  ngOnDestroy() {
    this.destroyed.complete();

    // finalize subjects
    this.generate$.complete();
    this.value$.complete();

    // finalize component bindings
    this.onGenerated.complete();
  }
}
